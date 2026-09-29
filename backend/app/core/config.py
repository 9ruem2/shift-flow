from pydantic import BaseModel
import os

class Settings(BaseModel):
    PROJECT_NAME: str = "ShiftFlow - Schedule Shifter & Integrity Validator"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: list[str] = ["*"]
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB

settings = Settings()
