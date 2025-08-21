# 🎯 ZPL 바코드 생성기

ZPL(Zebra Programming Language) 코드를 입력하면 바코드 이미지를 자동으로 생성하는 웹 애플리케이션입니다.

## ✨ 주요 기능

- **ZPL 코드 파싱**: ZPL 명령어를 자동으로 파싱하여 바코드 정보 추출
- **다양한 바코드 타입 지원**: Code 128, Code 39, QR Code, Data Matrix, EAN-13, UPC-A 등
- **실시간 바코드 생성**: 입력한 ZPL 코드에 따라 즉시 바코드 이미지 생성
- **템플릿 시스템**: 빠른 바코드 생성을 위한 템플릿 제공
- **이미지 다운로드**: 생성된 바코드를 PNG 형식으로 다운로드
- **반응형 디자인**: 모바일과 데스크톱에서 모두 사용 가능

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

1. 프로젝트 클론
```bash
git clone <repository-url>
cd zpl-form-app
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

4. 브라우저에서 `http://localhost:5173` 접속

## 📝 사용법

### 1. ZPL 코드 직접 입력

ZPL 코드를 텍스트 영역에 입력하고 "바코드 생성" 버튼을 클릭합니다.

**예시 ZPL 코드:**
```
^XA
^FO50,50^BC,100,Y,N,N
^FD123456789^FS
^XZ
```

### 2. 템플릿 사용

1. "템플릿 보기" 버튼 클릭
2. 바코드 타입 선택 (Code 128, QR Code 등)
3. 바코드 데이터 입력
4. "템플릿 적용" 버튼 클릭

### 3. 바코드 다운로드

- **개별 다운로드**: 각 바코드 카드의 "다운로드" 버튼 클릭
- **전체 다운로드**: "전체 다운로드" 버튼으로 모든 바코드 한 번에 다운로드

## 🔧 지원하는 바코드 타입

| 타입 | ZPL 명령어 | 설명 |
|------|------------|------|
| Code 128 | `^BC` | 일반적인 1D 바코드 |
| Code 39 | `^B3` | 산업용 1D 바코드 |
| QR Code | `^BQ` | 2D QR 코드 |
| Data Matrix | `^BX` | 2D 데이터 매트릭스 |
| EAN-13 | `^BE` | 유럽 상품 바코드 |
| UPC-A | `^BU` | 미국 상품 바코드 |

## 🛠️ 기술 스택

- **프론트엔드**: Svelte 5
- **빌드 도구**: Vite
- **바코드 생성**: bwip-js
- **ZPL 파싱**: 커스텀 파서
- **스타일링**: CSS3 (Grid, Flexbox)

## 📁 프로젝트 구조

```
src/
├── lib/
│   ├── zplParser.js      # ZPL 파싱 로직
│   └── barcodeGenerator.js # 바코드 생성 로직
├── App.svelte            # 메인 애플리케이션 컴포넌트
├── app.css              # 전역 스타일
└── main.js              # 애플리케이션 진입점
```

## 🎨 주요 디자인 특징

- **그라데이션 배경**: 세련된 보라색 그라데이션
- **카드 기반 레이아웃**: 깔끔한 카드 디자인
- **호버 효과**: 인터랙티브한 사용자 경험
- **반응형 그리드**: 다양한 화면 크기 지원
- **애니메이션**: 부드러운 전환 효과

## 🔍 ZPL 명령어 참고

### 기본 구조
```
^XA          # 라벨 시작
^FOx,y       # 필드 오리진 (위치)
^BC          # 바코드 명령어
^FDdata      # 필드 데이터
^FS          # 필드 구분자
^XZ          # 라벨 종료
```

### 주요 바코드 명령어
- `^BC` - Code 128 바코드
- `^B3` - Code 39 바코드
- `^BQ` - QR 코드
- `^BX` - Data Matrix
- `^BE` - EAN-13
- `^BU` - UPC-A

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🙏 감사의 말

- [bwip-js](https://github.com/metafloor/bwip-js) - 바코드 생성 라이브러리
- [Svelte](https://svelte.dev/) - 반응형 웹 프레임워크
- [Vite](https://vitejs.dev/) - 빠른 빌드 도구
