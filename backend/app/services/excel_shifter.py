import io
import re
from datetime import date, datetime, timedelta
from typing import Tuple, List, Dict, Any, Optional
import openpyxl
from openpyxl.utils import get_column_letter

from app.core.exceptions import MissingWorkdayColumnError, FileParsingError
from app.services.week_calculator import WeekCalculator

class ExcelShifter:
    """
    openpyxl 기반 날짜 치환 엔진
    - '업무일' 컬럼만 탐색 및 대상 요일 매핑
    - 기존 스타일, 포맷, 비어있는 셀 완벽 보존
    """

    WORKDAY_HEADER_CANDIDATES = ["업무일", "업무일자", "업무_일자", "일자", "날짜", "WORK_DATE", "WORKDATE"]

    @classmethod
    def parse_date_value(cls, val: Any) -> Optional[date]:
        """셀 값에서 date 객체 추출"""
        if val is None:
            return None
        if isinstance(val, datetime):
            return val.date()
        if isinstance(val, date):
            return val
        if isinstance(val, (int, float)):
            try:
                dt = openpyxl.utils.datetime.from_excel(val)
                return dt.date()
            except Exception:
                return None
        if isinstance(val, str):
            val_clean = val.strip()
            match = re.search(r'(\d{4})[-./](\d{1,2})[-./](\d{1,2})', val_clean)
            if match:
                y, m, d = map(int, match.groups())
                try:
                    return date(y, m, d)
                except ValueError:
                    return None
        return None

    @classmethod
    def format_date_like_original(cls, original_val: Any, new_dt: date) -> Any:
        """원본 값의 타입 및 문자열 포맷에 맞추어 변환된 날짜 반환"""
        if isinstance(original_val, datetime):
            return datetime(new_dt.year, new_dt.month, new_dt.day, original_val.hour, original_val.minute, original_val.second)
        if isinstance(original_val, date):
            return new_dt
        if isinstance(original_val, str):
            val_clean = original_val.strip()
            if "." in val_clean:
                return new_dt.strftime("%Y.%m.%d")
            elif "/" in val_clean:
                return new_dt.strftime("%Y/%m/%d")
            else:
                return new_dt.strftime("%Y-%m-%d")
        return datetime(new_dt.year, new_dt.month, new_dt.day)

    @classmethod
    def find_workday_column(cls, ws) -> Tuple[Optional[int], Optional[int], Optional[str]]:
        """
        워크시트에서 '업무일' 헤더 컬럼 및 행 위치 탐색
        반환: (header_row_idx, col_idx, matched_header_name) (1-indexed)
        """
        max_search_row = min(15, ws.max_row or 15)
        max_search_col = min(50, ws.max_column or 50)

        for r in range(1, max_search_row + 1):
            for c in range(1, max_search_col + 1):
                val = ws.cell(row=r, column=c).value
                if val and isinstance(val, str):
                    clean_val = val.strip().replace(" ", "")
                    for candidate in cls.WORKDAY_HEADER_CANDIDATES:
                        if candidate in clean_val or clean_val in candidate:
                            return r, c, val.strip()

        date_counts_per_col = {}
        for c in range(1, max_search_col + 1):
            count = 0
            for r in range(1, max_search_row + 15):
                val = ws.cell(row=r, column=c).value
                if cls.parse_date_value(val) is not None:
                    count += 1
            if count > 0:
                date_counts_per_col[c] = count

        if date_counts_per_col:
            best_col = max(date_counts_per_col, key=date_counts_per_col.get)
            for r in range(1, max_search_row + 1):
                if cls.parse_date_value(ws.cell(row=r, column=best_col).value) is not None:
                    header_r = max(1, r - 1)
                    header_name = str(ws.cell(row=header_r, column=best_col).value or "업무일(추정)")
                    return header_r, best_col, header_name

        return None, None, None

    @classmethod
    def transform_schedule_for_week(
        cls,
        file_bytes: bytes,
        target_week_info: Dict[str, Any]
    ) -> Tuple[bytes, List[Dict[str, Any]], Dict[str, Any]]:
        """
        특정 주차(일~토)에 맞추어 엑셀 파일의 업무일 날짜를 1:1 치환
        """
        try:
            wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=False)
        except Exception as e:
            raise FileParsingError(f"엑셀 파일을 열 수 없습니다: {str(e)}")

        ws = wb.active
        if ws is None:
            raise FileParsingError("유효한 워크시트가 존재하지 않습니다.")

        header_row, workday_col, header_name = cls.find_workday_column(ws)
        if workday_col is None:
            raise MissingWorkdayColumnError("엑셀 파일 내에서 '업무일' 컬럼을 찾을 수 없습니다.")

        target_sun = datetime.strptime(target_week_info["start_date"], "%Y-%m-%d").date()

        original_date_entries = []
        for r in range(header_row + 1, ws.max_row + 1):
            cell = ws.cell(row=r, column=workday_col)
            parsed_dt = cls.parse_date_value(cell.value)
            if parsed_dt is not None:
                original_date_entries.append({
                    "row": r,
                    "cell": cell,
                    "date": parsed_dt,
                    "original_val": cell.value,
                    "weekday": WeekCalculator.get_weekday_index(parsed_dt),
                    "day_name": WeekCalculator.get_korean_weekday_name(parsed_dt)
                })

        if not original_date_entries:
            raise MissingWorkdayColumnError(f"'{header_name}' 컬럼에 유효한 날짜 데이터가 없습니다.")

        mapping_records = []
        for entry in original_date_entries:
            r = entry["row"]
            cell = entry["cell"]
            orig_dt = entry["date"]
            weekday_idx = entry["weekday"]

            # 대상 주차의 동일 요일 날짜로 치환
            new_date = target_sun + timedelta(days=weekday_idx)
            new_val = cls.format_date_like_original(entry["original_val"], new_date)
            cell.value = new_val

            mapping_records.append({
                "row_index": r,
                "original_date": orig_dt.strftime("%Y-%m-%d"),
                "transformed_date": new_date.strftime("%Y-%m-%d"),
                "day_name": entry["day_name"],
                "target_week": target_week_info["formatted_range"]
            })

        out_stream = io.BytesIO()
        wb.save(out_stream)
        out_bytes = out_stream.getvalue()

        meta = {
            "workday_column_name": header_name,
            "workday_column_index": workday_col,
            "header_row": header_row,
            "total_rows": ws.max_row,
            "total_cols": ws.max_column,
            "workday_count": len(original_date_entries),
            "target_week_info": target_week_info
        }

        return out_bytes, mapping_records, meta
