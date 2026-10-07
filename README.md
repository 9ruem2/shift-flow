# ShiftFlow - 엑셀 일정 데이터 변환 및 무결성 검증기

사용자가 원본 엑셀 파일 2개(짝수/홀수)를 웹 브라우저에서 직접 업로드하고 대상 연월을 선택하면, **기존 서식/스타일/빈 셀을 100% 보존**하면서 새 연월의 격주 순환 주차 일정으로 자동 치환하고, **[옵션] 용차 기사(이름/ID) 치환** 및 **pandas 기반 4대 정밀 무결성 검증**을 수행하는 풀스택 웹 애플리케이션입니다.

---

## 🚀 주요 기능 및 핵심 룰

1. **사용자 직접 파일 업로드 (Drag & Drop)**
   - 파일명에 `'짝수'` 또는 `'홀수'` 키워드가 포함된 원본 엑셀 파일을 자동 식별하여 슬롯에 배치합니다 (macOS 자모 분리 완벽 지원).
2. **연초 기준 격주 순환 주차 룰 엔진 (일요일 ~ 토요일)**
   - 모든 주는 **일요일 시작 ~ 토요일 종료**입니다.
   - 연도 시작(1월 1일) 주차를 1주차(짝수주)로 시작하여 `[짝수주 → 홀수주 → 짝수주 → 홀수주]` 순서로 엄격히 교대합니다.
   - 대상 연월을 선택하면 해당 월에 포함된 모든 주차와 짝/홀 속성을 실시간으로 계산하며, 원하는 주차만 다중 선택할 수 있습니다.
3. **[순서 준수] openpyxl 기반 업무일 우선 치환 & [옵션] 용차 기사 치환**
   - **1단계(업무일 우선 치환):** `'업무일'` 컬럼을 탐색하여 동일 요일의 대상 날짜로 1:1 치환합니다.
   - **2단계(용차 기사 & ID 치환):** 변경된 새 업무일 기준 캠프/라우트(또는 기사명)를 찾아 지정된 용차 기사명 및 정적 마스터(`contract_drivers.json`)의 고유 ID로 치환합니다.
   - 캠프별 라우트 목록은 별도 파일(`camp_routes.json`)로 관리되며, UI 드롭다운을 통해 직관적으로 선택할 수 있습니다.
   - 기존 폰트, 배경색, 테두리, 수식, 행 높이, 열 너비, 빈 셀을 원본 그대로 완벽 보존합니다.
4. **pandas 기반 4대 정밀 무결성 검증 (Double-Checking)**
   - **규격 일치 (Shape):** 원본과 생성 파일 간 행/열 크기 100% 일치 확인
   - **데이터 불변성 (Invariance):** '업무일' 및 지정된 용차 치환(이름/ID) 외 모든 셀 `equals()` 비교로 100% 불변 검증
   - **날짜 적합성 (Date Validity):** 변환된 날짜가 대상 월 주차 범위 및 동일 요일에 맞게 배치되었는지 확인
   - **용차 치환 적합성 (Substitution Validity):** 지정된 행의 기사명 및 ID가 마스터 데이터와 100% 일치하는지 검증
5. **즉시 다운로드**
   - 주차별 엑셀 파일: `{대상월}월_{짝수/홀수}_{연간주차}주차.xlsx` (예: `10월_짝수_41주차.xlsx`)
   - 검증 리포트 텍스트가 포함된 일괄 ZIP 압축 파일 다운로드

---

## 🏗️ 시스템 아키텍처

```
[사용자 브라우저 (React + Vite)]
       │
       │ 1. 원본 파일 2개 업로드 (Drag & Drop)
       │    + 대상 연월 및 주차 다중 선택
       │    + [옵션] 용차 기사 교체 설정 (업무일 / 캠프 / 라우트 / 용차기사 드롭다운)
       ▼
[FastAPI Backend Server]
       │
       ├── ① 파일명 파싱 (짝수/홀수 판별)
       ├── ② 주차 룰 엔진 (연초 기준 격주 순환 계산: 일~토)
       ├── ③ 날짜 치환 엔진 (openpyxl 기반, 업무일 우선 치환)
       ├── ④ 용차 기사 치환 엔진 (새 업무일 기준 캠프/라우트/기사명 & ID 치환)
       ├── ⑤ 정밀 무결성 검증 엔진 (pandas Shape/Invariance/Date/Substitution 4대 체크)
       │
       └── ⑥ Zip 파일 또는 개별 .xlsx 스트림 응답
       │
       ▼
[결과 리포트 출력 + 엑셀 파일 즉시 다운로드]
```

---

## 📁 프로젝트 구조

```
shift-flow/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   └── schedule.py    # 업로드, 변환, 다운로드 API
│   │   │       └── router.py
│   │   ├── core/
│   │   │   ├── config.py              # 환경 설정
│   │   │   └── exceptions.py          # 사용자 정의 예외
│   │   ├── schemas/
│   │   │   └── schedule.py            # Pydantic DTO
│   │   ├── services/
│   │   │   ├── week_calculator.py     # 격주(짝/홀) 순환 계산 모듈
│   │   │   ├── excel_shifter.py       # openpyxl 기반 날짜 치환 로직
│   │   │   └── validator.py           # pandas 기반 무결성 검증 로직
│   │   └── main.py                    # FastAPI 진입점 & SPA 서빙
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── TargetMonthSelector.jsx
│   │   │   ├── FileDropzone.jsx
│   │   │   ├── ValidationReport.jsx
│   │   │   ├── SampleGenerator.jsx
│   │   │   └── ArchitectureModal.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🏃 실행 방법

### 1. 간편 개발 모드 (프론트엔드 + 백엔드 동시 실행, 추천)
루트 경로에서 명령어 하나로 백엔드와 프론트엔드를 동시에 실행합니다:
```bash
npm run dev
# 또는 yarn dev
```
- 프론트엔드 (Vite): **`http://localhost:5173`**
- 백엔드 API (FastAPI): **`http://127.0.0.1:8000`**

---

### 2. 개별 실행
```bash
# 백엔드만 실행
npm run backend
# 또는 npm run dev:backend

# 프론트엔드만 실행
npm run frontend
# 또는 npm run dev:frontend
```

---

### 3. 통합 서버 실행 (빌드된 UI 포함)
```bash
npm start
```
- 브라우저에서 **`http://127.0.0.1:8000`** 접속
