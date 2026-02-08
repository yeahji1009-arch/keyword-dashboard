# ⚡ 빠른 시작 가이드

## 🎯 가장 빠른 방법 (3분 완성)

### 1️⃣ standalone.html 파일 다운로드
- `standalone.html` 파일을 컴퓨터에 저장
- `js/` 폴더와 모든 JavaScript 파일도 함께 저장

### 2️⃣ Chrome 브라우저에서 열기
- `standalone.html` 파일을 더블클릭
- 또는 Chrome 브라우저로 드래그 앤 드롭

### 3️⃣ 완료! 🎉
- 자동으로 구글 시트 데이터를 불러옵니다
- 날짜를 선택하여 데이터 조회
- 탭을 전환하여 증감률 분석 확인

---

## 🌐 URL로 공유하고 싶다면?

### GitHub Pages (무료, 5분 소요)

#### 1. GitHub 계정 만들기
https://github.com 접속 → Sign up

#### 2. 새 Repository 생성
- 우측 상단 "+" 버튼 → "New repository"
- Repository name: `keyword-dashboard`
- Public 선택
- "Create repository" 클릭

#### 3. 파일 업로드
- "uploading an existing file" 클릭
- 모든 파일을 드래그 앤 드롭
  - `standalone.html` → `index.html`로 이름 변경해서 업로드
  - `js/` 폴더의 모든 파일
- "Commit changes" 클릭

#### 4. GitHub Pages 활성화
- Repository 상단 메뉴에서 "Settings" 클릭
- 왼쪽 메뉴에서 "Pages" 클릭
- Source: "Deploy from a branch" 선택
- Branch: "main" 선택
- "Save" 클릭

#### 5. URL 확인 (5분 후)
- 같은 페이지 상단에 URL 표시됨
- 예: `https://yourusername.github.io/keyword-dashboard`
- 이 URL을 팀원들과 공유!

---

## 🔑 필수 체크리스트

### ✅ 구글 시트 공유 설정
1. 구글 시트 열기
2. 우측 상단 "공유" 버튼 클릭
3. "일반 액세스" → "링크가 있는 모든 사용자"
4. 권한: "뷰어"
5. "완료" 클릭

**중요**: 이 설정이 안 되어 있으면 데이터를 불러올 수 없습니다!

### ✅ 시트 ID 확인
현재 설정된 시트 ID:
```
1U8WL2QcUY-Ujh8pJW6D4zljvRx1lFQkRH8-PXOReXwg
```

다른 시트를 사용하려면 `js/data-loader-standalone.js` 파일의 2번째 줄을 수정:
```javascript
const SHEET_ID = '여기에-새로운-시트-ID';
```

시트 ID는 구글 시트 URL에서 찾을 수 있습니다:
```
https://docs.google.com/spreadsheets/d/[시트ID]/edit
```

---

## 🎨 커스터마이징

### 제목 변경
`standalone.html` 또는 `index.html`의 8번째 줄:
```html
<title>우리회사 키워드 대시보드</title>
```

### 색상 변경
`standalone.html`의 `<style>` 태그 내부에서 색상 코드 변경:
- 네이버 색상: `.platform-badge-naver` (기본: 초록색 #03c75a)
- 인스타그램 색상: `.platform-badge-instagram` (기본: 그라데이션)
- 메인 색상: `text-blue-500`, `bg-blue-500` 등 (기본: 파란색)

---

## 📱 모바일에서 보기

### 바로가기 만들기 (iOS)
1. Safari에서 대시보드 열기
2. 하단 "공유" 버튼 탭
3. "홈 화면에 추가" 선택
4. 이름 입력 후 "추가"

### 바로가기 만들기 (Android)
1. Chrome에서 대시보드 열기
2. 우측 상단 "⋮" 메뉴
3. "홈 화면에 추가" 선택
4. 이름 입력 후 "추가"

---

## 🆘 자주 묻는 질문

### Q: 데이터가 안 보여요
**A:** 다음을 확인하세요:
1. 구글 시트 공유 설정 ("링크가 있는 모든 사용자")
2. 시트 ID가 정확한지
3. 브라우저 F12 → Console 탭에서 에러 메시지 확인

### Q: 새로고침 해도 데이터가 안 바뀌어요
**A:** 브라우저 캐시 때문일 수 있습니다:
- **Ctrl + Shift + R** (Windows)
- **Cmd + Shift + R** (Mac)
강력 새로고침을 해보세요.

### Q: CORS 에러가 나요
**A:** 3가지 해결 방법:
1. Chrome 브라우저 사용 (권장)
2. CORS 프록시가 자동으로 전환될 때까지 잠시 대기
3. GitHub Pages나 Google Apps Script 방법 사용

### Q: 회사 내부에서만 보고 싶어요
**A:** Google Apps Script 방법 사용:
1. DEPLOYMENT.md의 "방법 2" 참고
2. 배포 시 "조직 내 사용자"로 설정
3. 회사 계정으로만 접근 가능

### Q: 여러 시트의 데이터를 합치고 싶어요
**A:** 구글 시트에서 직접 합치세요:
1. 새 시트 생성
2. `=QUERY()` 함수로 여러 시트 데이터 통합
3. 통합된 시트의 ID로 대시보드 설정

---

## 🚀 다음 단계

### 더 많은 기능이 필요하다면?
- `DEPLOYMENT.md`: 고급 배포 방법
- `README.md`: 전체 기능 설명
- JavaScript 파일 수정: 커스텀 기능 추가

### 개선 아이디어
- [ ] 알림 기능 추가 (특정 키워드 급증 시)
- [ ] 주간/월간 리포트 자동 생성
- [ ] 키워드 순위 추적
- [ ] 경쟁사 비교 분석

---

## 💡 팁

### 매일 자동으로 열기 (Windows)
1. `standalone.html`의 바로가기 생성
2. 바로가기를 `C:\Users\[사용자명]\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup` 폴더에 이동
3. 컴퓨터 시작 시 자동으로 대시보드 열림

### 매일 자동으로 열기 (Mac)
1. 시스템 환경설정 → 사용자 및 그룹
2. 로그인 항목
3. "+" 버튼 → `standalone.html` 선택

### 북마크바에 추가
브라우저 북마크바에 대시보드 URL을 추가하여 빠른 접근!

---

**🎉 설정 완료! 이제 매일 아침 데이터를 확인하세요!**

문제가 있다면 DEPLOYMENT.md의 문제 해결 섹션을 참고하세요.
