import io
from datetime import date, datetime
from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np

from app.schemas.schedule import IntegrityReport
from app.services.excel_shifter import ExcelShifter
from app.services.week_calculator import WeekCalculator

class ScheduleValidator:
    """
    pandas 기반 무결성 검증 엔진
    1. 차원 일치 검증: Shape(행/열) 일치 검증
    2. 불변성 검증: equals() 비교 (업무일 제외 전 컬럼 불변성 테스트)
    3. 날짜 적합성 검증: 대상 주차 및 요일 일치 검증
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
        mappings: List[Dict[str, Any]]
    ) -> IntegrityReport:
        """
        원본과 변환된 엑셀 파일 간의 데이터 무결성을 엄격하게 교차 검증
        """
        # pandas로 데이터프레임 로드
        df_orig = pd.read_excel(io.BytesIO(orig_bytes), header=None)
        df_trans = pd.read_excel(io.BytesIO(transformed_bytes), header=None)

        # 1. 차원 일치 검증 (Dimension Match)
        orig_shape = df_orig.shape
        trans_shape = df_trans.shape
        dimension_match = (orig_shape == trans_shape)

        # 2. 불변성 검증 (Invariance Match - '업무일' 컬럼 제외 전 컬럼 비교)
        workday_col_idx = meta.get("workday_column_index", 1) - 1 # 0-indexed for pandas
        
        non_workday_cols = [c for c in range(orig_shape[1]) if c != workday_col_idx]
        
        df_orig_non_work = df_orig.iloc[:, non_workday_cols]
        df_trans_non_work = df_trans.iloc[:, non_workday_cols]

        df_orig_filled = df_orig_non_work.fillna("__NULL_VALUE__")
        df_trans_filled = df_trans_non_work.fillna("__NULL_VALUE__")
        
        invariance_match = df_orig_filled.equals(df_trans_filled)
        
        difference_count = 0
        if not invariance_match:
            diff_mask = (df_orig_filled != df_trans_filled)
            difference_count = int(diff_mask.values.sum())

        # 3. 날짜 적합성 검증 (Date Validity Match)
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

        all_passed = dimension_match and invariance_match and date_validity_match

        return IntegrityReport(
            dimension_match=dimension_match,
            dimension_original=orig_shape,
            dimension_transformed=trans_shape,
            invariance_match=invariance_match,
            invariance_difference_count=difference_count,
            date_validity_match=date_validity_match,
            date_validity_message=date_validity_message,
            workday_column_name=meta.get("workday_column_name", "업무일"),
            workday_count=meta.get("workday_count", len(mappings)),
            all_passed=all_passed
        )
