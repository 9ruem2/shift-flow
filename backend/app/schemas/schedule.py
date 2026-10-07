from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Tuple

class ContractDriver(BaseModel):
    name: str
    id: str

class DriverSubstitutionRule(BaseModel):
    target_date: str                 # YYYY-MM-DD
    camp: Optional[str] = None       # 캠프명 (예: "구리2")
    route: Optional[str] = None      # 라우트 (예: "905C,905D")
    original_driver_name: Optional[str] = None # 기존 기사명 (호환용)
    new_driver_name: str             # 바꿀 용차 기사명
    new_driver_id: Optional[str] = None # 용차 기사 ID (생략 시 마스터에서 자동 조회)

class SubstitutionRecord(BaseModel):
    target_date: str
    camp: Optional[str] = None
    route: Optional[str] = None
    original_driver_name: Optional[str] = None
    new_driver_name: str
    new_driver_id: str
    row_index: int
    applied: bool = True

class WeekInfo(BaseModel):
    week_number: int         # 연간 주차 (예: 41)
    month_week_number: int   # 해당 월 주차 (예: 1, 2, 3...)
    week_type: str           # 'EVEN' or 'ODD'
    week_label: str          # '짝수' or '홀수'
    week_full_label: str     # '짝수주' or '홀수주'
    start_date: str          # YYYY-MM-DD (Sunday)
    end_date: str            # YYYY-MM-DD (Saturday)
    formatted_range: str
    suggested_filename: str  # 예: 10월_짝수_1주차.xlsx

class DateMappingItem(BaseModel):
    original_date: str
    transformed_date: str
    day_name: str
    row_index: int

class IntegrityReport(BaseModel):
    dimension_match: bool
    dimension_original: Tuple[int, int]
    dimension_transformed: Tuple[int, int]
    invariance_match: bool
    invariance_difference_count: int
    date_validity_match: bool
    date_validity_message: str
    substitution_match: bool = True
    substitution_count: int = 0
    substitution_message: str = ""
    workday_column_name: str
    workday_count: int
    all_passed: bool

class FileTransformResult(BaseModel):
    week_number: int
    month_week_number: int
    file_type: str           # 'EVEN' or 'ODD'
    file_type_label: str     # '짝수' or '홀수'
    original_filename: str
    output_filename: str     # 월_주_주차.xlsx (예: 10월_짝수_1주차.xlsx)
    file_size_bytes: int
    download_key: str
    integrity: IntegrityReport
    sample_mappings: List[DateMappingItem] = []
    substitution_records: List[SubstitutionRecord] = []
    week_info: WeekInfo

class TransformResponse(BaseModel):
    success: bool
    target_year: int
    target_month: int
    formatted_target: str
    batch_id: str
    files: List[FileTransformResult]
    all_integrity_passed: bool
    calendar_weeks: List[WeekInfo] = []
    created_at: str

class MonthWeeksResponse(BaseModel):
    year: int
    month: int
    weeks: List[WeekInfo]

