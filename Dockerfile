# ==========================================
# 1단계: 프론트엔드 React 빌드
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /build

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci || npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# 2단계: 백엔드 FastAPI 및 통합 런타임
# ==========================================
FROM python:3.11-slim AS production

WORKDIR /app

# 기본 시스템 패키지 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 파이썬 의존성 설치
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 백엔드 소스코드 복사
COPY backend/ /app/

# 빌드된 프론트엔드 정적 파일 복사
COPY --from=frontend-builder /build/dist /frontend/dist

# 환경변수 설정
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# 헬스체크
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 서버 실행
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
