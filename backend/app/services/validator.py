import io
from datetime import date, datetime
from typing import Dict, Any, List, Tuple, Optional, Set
import pandas as pd
import numpy as np

from app.schemas.schedule import IntegrityReport, SubstitutionRecord
from app.services.excel_shifter import ExcelShifter
from app.services.week_calculator import WeekCalculator

class ScheduleValidator:
    """
    pandas 기반 무결성 검증 엔진
    1. 차원 일치 검증: Shape(행/열) 100% 일치 확인
    2. 데이터 불변성 검증 (Invariance Match):
       - 업무일 컬럼 제외
       - 용차 기사 교체 행의 기사명/아이디를 제외한 모든 컬럼 및 셀의 완벽 불변(100% 원본 일치) 검증
       - 교체되지 않은 일반 행들의 기사명/아이디 셀 역시 원본과 100% 일치해야 함
    3. 용차 기사 치환 검증 (Substitution Match):
       - 지정된 행의 기사명 및 ID가 요청된 용차 기사 정보로 정확히 치환되었는지 검증
    4. 날짜 적합성 검증: 대상 주차 범위 및 동일 요일 일치 검증
    """

    @classmethod
    def validate_integrity(
        cls,
        orig_bytes: bytes,
        transformed_bytes: bytes,
        file_type: str,
        target_year: int,
        target_month: int,
        meta: Dict[str, Any],
        mappings: List[Dict[str, Any]],
        applied_substitutions: Optional[List[SubstitutionRecord]] = None
    ) -> IntegrityReport:
        """
        원본과 변환된 엑셀 파일 간의 데이터 무결성을 엄격하게 교차 검증
        """
        applied_substitutions = applied_substitutions or []

        # pandas로 데이터프레임 로드 (0-indexed)
        df_orig = pd.read_excel(io.BytesIO(orig_bytes), header=None)
        df_trans = pd.read_excel(io.BytesIO(transformed_bytes), header=None)

        # -------------------------------------------------------------
        # 1. 차원 일치 검증 (Dimension Match)
        # -------------------------------------------------------------
        orig_shape = df_orig.shape
        trans_shape = df_trans.shape
        dimension_match = (orig_shape == trans_shape)

        # -------------------------------------------------------------
        # 2. 용차 기사 치환 적합성 검증 (Substitution Match)
        # -------------------------------------------------------------
        substitution_match = True
        sub_messages = []
        name_col_idx = (meta.get("driver_name_column_index") - 1) if meta.get("driver_name_column_index") else None
        id_col_idx = (meta.get("driver_id_column_index") - 1) if meta.get("driver_id_column_index") else None

        substituted_row_indices: Set[int] = set() # 0-indexed pandas row indices

        for sub in applied_substitutions:
            r_idx = sub.row_index - 1 # 1-indexed to 0-indexed
            substituted_row_indices.add(r_idx)

            # 기사명 치환 검증
            if name_col_idx is not None and r_idx < trans_shape[0] and name_col_idx < trans_shape[1]:
                actual_name = str(df_trans.iloc[r_idx, name_col_idx] or "").strip()
                if actual_name != sub.new_driver_name.strip():
                    substitution_match = False
                    sub_messages.append(f"행 {sub.row_index}: 기사명 치환 불일치 (기대: {sub.new_driver_name}, 실제: {actual_name})")

            # 기사 ID 치환 검증
            if id_col_idx is not None and r_idx < trans_shape[0] and id_col_idx < trans_shape[1]:
                actual_id = str(df_trans.iloc[r_idx, id_col_idx] or "").strip()
                expected_id = (sub.new_driver_id or "").strip()
                if expected_id and actual_id != expected_id:
                    substitution_match = False
                    sub_messages.append(f"행 {sub.row_index}: 기사ID 치환 불일치 (기대: {expected_id}, 실제: {actual_id})")

        if len(applied_substitutions) == 0:
            substitution_message = "용차 기사 교체 내역 없음"
        elif substitution_match:
            substitution_message = f"용차 기사 교체 {len(applied_substitutions)}건 정상 반영 및 검증 통과"
        else:
            substitution_message = f"용차 기사 검증 실패: {'; '.join(sub_messages[:2])}"

        # -------------------------------------------------------------
        # 3. 데이터 불변성 검증 (Invariance Match)
        # 업무일 컬럼 및 정상 치환된 셀을 제외한 "모든 셀"은 원본과 100% 동일해야 함
        # -------------------------------------------------------------
        workday_col_idx = meta.get("workday_column_index", 1) - 1 # 0-indexed

        df_orig_filled = df_orig.fillna("__NULL_VALUE__").astype(str)
        df_trans_filled = df_trans.fillna("__NULL_VALUE__").astype(str)

        diff_count = 0

        for r in range(orig_shape[0]):
            for c in range(orig_shape[1]):
                # 1) 업무일 컬럼은 날짜 치환 대상이므로 Invariance 비교에서 제외 (별도 Date Validity에서 검증)
                if c == workday_col_idx:
                    continue

                # 2) 용차 기사 교체가 적용된 행의 기사명/ID 컬럼은 치환 대상이므로 제외 (이미 위에서 정밀 검증함)
                if r in substituted_row_indices and (c == name_col_idx or c == id_col_idx):
                    continue

                # 3) 그 외의 모든 셀은 원본과 완벽히 같아야 함
                orig_val = df_orig_filled.iloc[r, c].strip()
                trans_val = df_trans_filled.iloc[r, c].strip()

                if orig_val != trans_val:
                    diff_count += 1

        invariance_match = (diff_count == 0)

        # -------------------------------------------------------------
        # 4. 날짜 적합성 검증 (Date Validity Match)
        # -------------------------------------------------------------
        date_validity_match = True
        invalid_reasons = []

        valid_date_set = set()
        if "target_week_info" in meta:
            w_info = meta["target_week_info"]
            if "days" in w_info:
                valid_date_set.update(w_info["days"])
            else:
                sun = datetime.strptime(w_info["start_date"], "%Y-%m-%d").date()
                for d in range(7):
                    valid_date_set.add((sun + pd.Timedelta(days=d)).strftime("%Y-%m-%d"))
        elif "target_weeks" in meta:
            for w in meta["target_weeks"]:
                for d_str in w.get("days", []):
                    valid_date_set.add(d_str)

        for m in mappings:
            trans_date_str = m["transformed_date"]
            orig_date_str = m["original_date"]

            t_dt = datetime.strptime(trans_date_str, "%Y-%m-%d").date()
            o_dt = datetime.strptime(orig_date_str, "%Y-%m-%d").date()
            
            # 요일 일치 검증
            if WeekCalculator.get_weekday_index(t_dt) != WeekCalculator.get_weekday_index(o_dt):
                date_validity_match = False
                invalid_reasons.append(f"행 {m['row_index']}: 요일 불일치 ({orig_date_str} -> {trans_date_str})")
                break

            # 대상 주차 범위 검증
            if valid_date_set and trans_date_str not in valid_date_set:
                date_validity_match = False
                invalid_reasons.append(f"행 {m['row_index']}: 주차 범위 외 날짜 ({trans_date_str})")
                break

        if date_validity_match:
            date_validity_message = f"업무일 날짜({len(mappings)}건)가 주차 범위 및 동일 요일에 100% 정상 배치됨"
        else:
            date_validity_message = f"날짜 검증 실패: {'; '.join(invalid_reasons[:2])}"

        all_passed = dimension_match and invariance_match and date_validity_match and substitution_match

        return IntegrityReport(
            dimension_match=dimension_match,
            dimension_original=orig_shape,
            dimension_transformed=trans_shape,
            invariance_match=invariance_match,
            invariance_difference_count=diff_count,
            date_validity_match=date_validity_match,
            date_validity_message=date_validity_message,
            substitution_match=substitution_match,
            substitution_count=len(applied_substitutions),
            substitution_message=substitution_message,
            workday_column_name=meta.get("workday_column_name", "업무일"),
            workday_count=meta.get("workday_count", len(mappings)),
            all_passed=all_passed
        )

