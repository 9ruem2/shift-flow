from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

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
    dimension_original: tuple[int, int]
    dimension_transformed: tuple[int, int]
    invariance_match: bool
    invariance_difference_count: int
    date_validity_match: bool
    date_validity_message: str
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
