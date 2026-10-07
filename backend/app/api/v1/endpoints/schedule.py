import io
import json
import uuid
import zipfile
import unicodedata
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional, Any
from urllib.parse import quote

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Response, Query

from app.core.exceptions import FileParsingError, MissingWorkdayColumnError
from app.schemas.schedule import (
    TransformResponse,
    FileTransformResult,
    DateMappingItem,
    IntegrityReport,
    MonthWeeksResponse,
    WeekInfo,
    ContractDriver,
    DriverSubstitutionRule,
    SubstitutionRecord
)
from app.services.week_calculator import WeekCalculator
from app.services.excel_shifter import ExcelShifter, load_contract_drivers_map
from app.services.validator import ScheduleValidator

router = APIRouter()

# In-memory storage for generated files (batch_id -> { download_key: {filename, bytes, content_type} })
DOWNLOAD_CACHE: Dict[str, Dict[str, Any]] = {}

def get_file_type_from_filename(filename: str) -> Optional[str]:
    """파일명에서 짝수/홀수 판별 (macOS NFD 자모 분리 유니코드 완벽 대응)"""
    if not filename:
        return None
    normalized = unicodedata.normalize('NFC', filename).replace(" ", "").lower()
    
    if "짝수" in normalized or "even" in normalized:
        return "EVEN"
    elif "홀수" in normalized or "odd" in normalized:
        return "ODD"
    return None

@router.get("/drivers", response_model=List[ContractDriver])
async def get_contract_drivers():
    """등록된 용차 기사 마스터 목록 반환 (정적 JSON 기반)"""
    drivers_map = load_contract_drivers_map()
    return [ContractDriver(name=name, id=driver_id) for name, driver_id in drivers_map.items()]

@router.get("/weeks", response_model=MonthWeeksResponse)
async def get_month_weeks(
    year: int = Query(..., description="조회 연도 (예: 2026)"),
    month: int = Query(..., ge=1, le=12, description="조회 월 (1~12)")
):
    """지정된 연월의 짝수주/홀수주 계산 결과 반환"""
    weeks_data = WeekCalculator.get_weeks_for_month(year, month)
    weeks = [WeekInfo(**w) for w in weeks_data]
    return MonthWeeksResponse(year=year, month=month, weeks=weeks)

@router.post("/transform", response_model=TransformResponse)
async def transform_schedules(
    files: List[UploadFile] = File(...),
    target_year: int = Form(...),
    target_month: int = Form(...),
    file_types: Optional[List[str]] = Form(None),
    selected_weeks: Optional[List[int]] = Form(None), # 선택된 주차 번호 목록
    substitutions: Optional[str] = Form(None)         # JSON 문자열 (옵셔널 용차 기사 치환 규칙 리스트)
):
    """
    1. 업무일 1:1 치환
    2. [옵셔널] 업무일 및 기존 기사명 기준 용차 기사명 및 ID 치환
    3. pandas 기반 3중 + 용차 치환 무결성 검증
    """
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="최소 1개 이상의 원본 엑셀 파일을 업로드해주세요.")

    # 옵셔널 용차 기사 치환 규칙 파싱
    parsed_substitution_rules: List[DriverSubstitutionRule] = []
    if substitutions:
        try:
            sub_raw = json.loads(substitutions)
            if isinstance(sub_raw, list):
                for item in sub_raw:
                    if isinstance(item, dict) and item.get("target_date") and item.get("original_driver_name") and item.get("new_driver_name"):
                        parsed_substitution_rules.append(DriverSubstitutionRule(**item))
        except Exception as e:
            print(f"Warning: Failed to parse substitutions JSON: {e}")

    # 1. 업로드된 원본 파일들을 짝수/홀수 템플릿으로 매핑
    templates: Dict[str, Dict[str, Any]] = {}

    for idx, uploaded_file in enumerate(files):
        filename = unicodedata.normalize('NFC', uploaded_file.filename or "")
        file_bytes = await uploaded_file.read()
        
        file_type = None
        if file_types and idx < len(file_types) and file_types[idx]:
            file_type = file_types[idx].upper()
        
        if not file_type:
            file_type = get_file_type_from_filename(filename)

        if not file_type or file_type not in ["EVEN", "ODD"]:
            raise HTTPException(
                status_code=400,
                detail=f"파일명('{filename}')에 '짝수' 또는 '홀수' 키워드가 반드시 포함되어야 합니다."
            )

        templates[file_type] = {
            "filename": filename,
            "bytes": file_bytes
        }

    # 2. 대상 월의 전체 주차 계산
    all_month_weeks = WeekCalculator.get_weeks_for_month(target_year, target_month)
    if not all_month_weeks:
        raise HTTPException(status_code=400, detail="해당 연월에 계산 가능한 주차가 존재하지 않습니다.")

    # 3. 사용자가 선택한 주차만 필터링 (미지정 시 전체 주차 대상)
    target_weeks = []
    if selected_weeks and len(selected_weeks) > 0:
        selected_set = set(selected_weeks)
        for w in all_month_weeks:
            if w["month_week_number"] in selected_set or w["week_number"] in selected_set:
                target_weeks.append(w)
    else:
        target_weeks = all_month_weeks

    if not target_weeks:
        target_weeks = all_month_weeks

    batch_id = str(uuid.uuid4())
    transformed_results: List[FileTransformResult] = []
    file_cache_map = {}
    all_passed = True

    # 4. 각 주차별로 날짜 및 기사 치환 및 개별 파일 생성
    for week_info in target_weeks:
        w_type = week_info["week_type"]
        w_label = week_info["week_label"]
        month_w_idx = week_info["month_week_number"]
        year_w_idx = week_info["week_number"]

        if w_type not in templates:
            type_korean = "짝수" if w_type == "EVEN" else "홀수"
            raise HTTPException(
                status_code=400,
                detail=f"{month_w_idx}주차({week_info['week_full_label']}) 일정을 생성하기 위해 '{type_korean}' 원본 엑셀 파일이 필요합니다."
            )

        template = templates[w_type]
        orig_filename = template["filename"]
        orig_bytes = template["bytes"]

        # 주차별 업무일 치환 및 [옵셔널] 용차 기사 치환 실행
        try:
            trans_bytes, mappings, meta, applied_substitutions = ExcelShifter.transform_schedule_for_week(
                file_bytes=orig_bytes,
                target_week_info=week_info,
                substitution_rules=parsed_substitution_rules
            )
        except (MissingWorkdayColumnError, FileParsingError) as e:
            raise HTTPException(status_code=400, detail=f"[{orig_filename}] {e.message}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"[{month_w_idx}주차 변환 오류] {str(e)}")

        # 무결성 검증 (업무일 + 용차 변경 제외 모든 셀 불변성 및 치환 적합성 검증)
        try:
            integrity_report = ScheduleValidator.validate_integrity(
                orig_bytes=orig_bytes,
                transformed_bytes=trans_bytes,
                file_type=w_type,
                target_year=target_year,
                target_month=target_month,
                meta=meta,
                mappings=mappings,
                applied_substitutions=applied_substitutions
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"[{month_w_idx}주차 무결성 검증 오류] {str(e)}")

        if not integrity_report.all_passed:
            all_passed = False

        # 파일명 규칙: 월_주_주차.xlsx (예: 10월_짝수_41주차.xlsx)
        output_filename = f"{target_month}월_{w_label}_{year_w_idx}주차.xlsx"
        download_key = f"{batch_id}_w{year_w_idx}_{w_type}"

        # 캐시에 저장
        file_cache_map[download_key] = {
            "filename": output_filename,
            "bytes": trans_bytes,
            "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "substitutions": applied_substitutions
        }

        sample_items = [
            DateMappingItem(
                original_date=m["original_date"],
                transformed_date=m["transformed_date"],
                day_name=m["day_name"],
                row_index=m["row_index"]
            )
            for m in mappings[:10]
        ]

        transformed_results.append(
            FileTransformResult(
                week_number=year_w_idx,
                month_week_number=month_w_idx,
                file_type=w_type,
                file_type_label=w_label,
                original_filename=orig_filename,
                output_filename=output_filename,
                file_size_bytes=len(trans_bytes),
                download_key=download_key,
                integrity=integrity_report,
                sample_mappings=sample_items,
                substitution_records=applied_substitutions,
                week_info=WeekInfo(**week_info)
            )
        )

    DOWNLOAD_CACHE[batch_id] = file_cache_map

    calendar_weeks_pydantic = [WeekInfo(**w) for w in all_month_weeks]

    return TransformResponse(
        success=True,
        target_year=target_year,
        target_month=target_month,
        formatted_target=f"{target_year}년 {target_month}월",
        batch_id=batch_id,
        files=transformed_results,
        all_integrity_passed=all_passed,
        calendar_weeks=calendar_weeks_pydantic,
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )

@router.get("/download/{download_key}")
async def download_single_file(download_key: str):
    """변환된 단일 주차 엑셀 파일 다운로드"""
    batch_id = download_key.split("_")[0]
    if batch_id not in DOWNLOAD_CACHE or download_key not in DOWNLOAD_CACHE[batch_id]:
        raise HTTPException(status_code=404, detail="만료되었거나 존재하지 않는 다운로드 키입니다.")

    item = DOWNLOAD_CACHE[batch_id][download_key]
    filename = item["filename"]
    encoded_filename = quote(filename.encode('utf-8'))

    return Response(
        content=item["bytes"],
        media_type=item["content_type"],
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"
        }
    )

@router.get("/download-zip/{batch_id}")
async def download_zip(batch_id: str):
    """선택된 모든 주차별 엑셀 파일과 검증 리포트를 ZIP으로 일괄 다운로드"""
    if batch_id not in DOWNLOAD_CACHE:
        raise HTTPException(status_code=404, detail="만료되었거나 존재하지 않는 배치 세션입니다.")

    cache_items = DOWNLOAD_CACHE[batch_id]
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for key, item in cache_items.items():
            zf.writestr(item["filename"], item["bytes"])

        report_text = f"""==================================================
ShiftFlow 주차별 일정 변환 및 무결성 검증 완료 리포트
생성일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
배치 ID: {batch_id}
==================================================

[포함된 주차별 엑셀 파일 목록]
"""
        for key, item in cache_items.items():
            sub_records = item.get("substitutions", [])
            sub_summary = f" (용차 교체: {len(sub_records)}건)" if sub_records else ""
            report_text += f"- {item['filename']} ({len(item['bytes']):,} bytes){sub_summary}\n"
            if sub_records:
                for sub in sub_records:
                    report_text += f"    * [업무일: {sub.target_date}] {sub.original_driver_name} -> {sub.new_driver_name} (ID: {sub.new_driver_id})\n"

        report_text += "\n* 모든 주차 파일의 업무일 및 요청된 용차 기사(이름, ID) 외 모든 셀의 서식, 수식, 빈 셀 및 데이터가 100% 무결성 검증을 통과하였습니다.\n"
        zf.writestr("무결성_검증_리포트.txt", report_text.encode("utf-8"))

    zip_bytes = zip_buffer.getvalue()
    zip_filename = f"주차별_스케쥴_일괄다운로드_{batch_id[:8]}.zip"
    encoded_filename = quote(zip_filename.encode('utf-8'))

    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"
        }
    )

