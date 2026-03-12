# 장애관리시스템 (FaultManagementSystem) ver3

ITS(지능형교통시스템) 현장장비 장애관리 웹앱

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 18, TypeScript, jQuery |
| Backend/DB | Firebase Firestore |
| Storage | Firebase Storage |
| Auth | Firebase Authentication |
| 브라우저 | Chrome, Edge |

## Firebase 프로젝트 정보

- **Project ID**: `fmsver3`
- **Region**: asia-southeast1 (싱가포르)
- **Firestore**: 실시간 장애/시설 데이터 저장
- **Storage**: 현장 사진, 전경 사진 저장

## 주요 기능

### 🔐 인증
- 회원가입 / 로그인 (관리자 / 사용자 구분)
- 관리자: 계정 삭제 권한

### 📊 대시보드
- 접수 / 처리중 / 완료 현황 통계 카드
- 카드 클릭 → 해당 상태 필터 장애이력 이동

### 📝 장애신청
- 신청일(캘린더), 소속, 신청인, 연락처, 주소, 고장증상
- 처리상태: 접수 / 처리중 / 완료
- 처리중·완료 시: AS담당자, 처리내용, 처리일, 장비ID검색
- 접수·완료 시: 사진 업로드
- 주소 팝업: 기등록 장비 우선 검색, 없으면 신규 입력

### 📋 장애이력목록
- 검색 + 상태 필터
- 항목 클릭 → 상세 모달 (수정/삭제)
- AS담당자, 처리일 컬럼 표출

### 🏗 시설정보
- 사업명, 장비명, 주소, 이정, 장비수용정보(ID/IP/GW/서브넷), 비고
- 전경 사진 업로드/삭제

### 🗺 시설관리현황
- 등록 장비 목록
- 엑셀(CSV) 출력
- 장비별 장애이력 팝업 (장비ID·날짜·IP·장소 필터)

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build
```

## 프로젝트 구조

```
FMSver3/
├── public/
│   └── index.html
├── src/
│   ├── firebase.ts          # Firebase 초기화
│   ├── App.tsx              # 메인 앱 (FaultManagementSystem.jsx)
│   ├── index.tsx
│   └── react-app-env.d.ts
├── package.json
├── tsconfig.json
└── README.md
```

## 테스트 계정

| 계정 | 이메일 | 비밀번호 | 권한 |
|------|--------|----------|------|
| 관리자 | admin@its.go.kr | admin123 | 관리자 |
| 사용자 | hong@its.go.kr  | user123  | 사용자 |

---
© 2025 ITS 장애관리시스템 FMSver3
