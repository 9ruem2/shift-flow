from datetime import date, datetime, timedelta
from typing import List, Dict, Optional, Tuple

KOREAN_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]

class WeekCalculator:
    """
    주차 룰 엔진 (연초 기준 격주 순환 계산: 일~토)
    
    규칙:
    1. 모든 주의 시작은 일요일(Sunday), 종료는 토요일(Saturday).
    2. 연도 시작일(1월 1일)이 포함된 일~토 주차를 1주차로 정의.
    3. 격주 교대 순환: [1주차: 짝수주 -> 2주차: 홀수주 -> 3주차: 짝수주 -> 4주차: 홀수주 ...]
    """
    
    @staticmethod
    def get_first_sunday_of_year(year: int) -> date:
        """연도 1월 1일이 속한 주의 일요일(시작일) 계산"""
        jan1 = date(year, 1, 1)
        offset = (jan1.weekday() + 1) % 7
        return jan1 - timedelta(days=offset)
    
    @classmethod
    def get_weeks_for_month(cls, year: int, month: int) -> List[Dict]:
        """
        해당 연월에 걸쳐있는 모든 주차(일~토) 목록 반환
        month_week_number: 해당 월의 몇 번째 주차인지 (1주차, 2주차...)
        """
        first_sun = cls.get_first_sunday_of_year(year)
        weeks = []
        month_week_idx = 1
        
        # 1년은 최대 54주
        for week_no in range(1, 55):
            week_start = first_sun + timedelta(days=(week_no - 1) * 7)
            week_end = week_start + timedelta(days=6)
            
            # 주차 내에 해당 월의 날짜가 하루라도 포함되어 있는지 확인
            has_month_days = any(
                (week_start + timedelta(days=d)).year == year and 
                (week_start + timedelta(days=d)).month == month
                for d in range(7)
            )
            
            if has_month_days:
                is_even_week = (week_no % 2 == 1)
                week_type = "EVEN" if is_even_week else "ODD"
                week_label = "짝수" if is_even_week else "홀수"
                week_full_label = "짝수주" if is_even_week else "홀수주"
                
                filename = f"{month}월_{week_label}_{week_no}주차.xlsx"
                
                weeks.append({
                    "week_number": week_no,
                    "month_week_number": month_week_idx,
                    "week_type": week_type,
                    "week_label": week_label,
                    "week_full_label": week_full_label,
                    "start_date": week_start.strftime("%Y-%m-%d"),
                    "end_date": week_end.strftime("%Y-%m-%d"),
                    "formatted_range": f"{week_start.strftime('%Y.%m.%d')}(일) ~ {week_end.strftime('%m.%d')}(토)",
                    "days": [(week_start + timedelta(days=d)).strftime("%Y-%m-%d") for d in range(7)],
                    "suggested_filename": filename
                })
                month_week_idx += 1
            elif week_start.year > year or (week_start.year == year and week_start.month > month):
                if len(weeks) > 0:
                    break
                    
        return weeks

    @classmethod
    def get_target_weeks_by_type(cls, year: int, month: int, week_type: str) -> List[Dict]:
        """지정된 연월의 짝수주(EVEN) 또는 홀수주(ODD) 주차들만 필터링"""
        all_weeks = cls.get_weeks_for_month(year, month)
        return [w for w in all_weeks if w["week_type"] == week_type]

    @staticmethod
    def get_weekday_index(dt: date) -> int:
        """일요일=0, 월요일=1, ..., 토요일=6 반환"""
        return (dt.weekday() + 1) % 7
    
    @staticmethod
    def get_korean_weekday_name(dt: date) -> str:
        """요일 한글명 반환 (일, 월, 화, 수, 목, 금, 토)"""
        idx = (dt.weekday() + 1) % 7
        return KOREAN_WEEKDAYS[idx]
