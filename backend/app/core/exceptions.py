class ShiftFlowException(Exception):
    """Base exception for ShiftFlow application."""
    def __init__(self, message: str, code: str = "VALIDATION_ERROR", status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code


class FileParsingError(ShiftFlowException):
    def __init__(self, message: str):
        super().__init__(message, code="FILE_PARSING_ERROR", status_code=400)


class MissingWorkdayColumnError(ShiftFlowException):
    def __init__(self, message: str = "'업무일' 컬럼을 찾을 수 없습니다."):
        super().__init__(message, code="MISSING_WORKDAY_COLUMN", status_code=400)


class IntegrityCheckFailedError(ShiftFlowException):
    def __init__(self, message: str, details: dict = None):
        super().__init__(message, code="INTEGRITY_CHECK_FAILED", status_code=422)
        self.details = details or {}
