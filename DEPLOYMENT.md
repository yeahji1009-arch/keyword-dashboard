# 🚀 독립 실행 가이드

젠슨파크 없이 대시보드를 독립적으로 실행하는 3가지 방법을 제공합니다.

---

## 방법 1: GitHub Pages로 무료 배포 (추천 ⭐)

### 장점
- ✅ 완전 무료
- ✅ HTTPS 자동 지원
- ✅ 고유 URL 제공 (예: `https://username.github.io/dashboard`)
- ✅ 자동 업데이트 (Git push만 하면 됨)

### 배포 방법

1. **GitHub 계정 생성 및 레포지토리 생성**
   - https://github.com 에서 계정 생성
   - 새 Repository 생성 (예: `keyword-dashboard`)
   - Public으로 설정

2. **파일 업로드**
   ```
   keyword-dashboard/
   ├── index.html (standalone.html을 index.html로 변경)
   ├── js/
   │   ├── data-loader-standalone.js
   │   ├── dashboard-daily.js
   │   ├── dashboard-comparison.js
   │   └── main.js
   └── README.md
   ```

3. **GitHub Pages 활성화**
   - Repository → Settings → Pages
   - Source: "Deploy from a branch" 선택
   - Branch: "main" 선택, 폴더: "/ (root)" 선택
   - Save 클릭

4. **접속**
   - 5분 후 `https://[username].github.io/[repository-name]` 에서 확인
   - 예: `https://mycompany.github.io/keyword-dashboard`

---

## 방법 2: Google Apps Script 웹앱 배포

### 장점
- ✅ 구글 시트와 직접 연동
- ✅ 서버리스 (관리 불필요)
- ✅ 인증 설정 가능 (회사 내부만 접근)

### 배포 방법

1. **Google Apps Script 열기**
   - 구글 시트 열기
   - 확장 프로그램 → Apps Script

2. **코드 작성**

**Code.gs**:
```javascript
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('키워드 노출량 대시보드')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getSheetData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0]; // 첫 번째 시트
  const data = sheet.getDataRange().getValues();
  
  // 헤더 제외하고 3행부터
  const rows = data.slice(3);
  
  return rows.map(row => ({
    date: row[1],
    storeName: row[2],
    platform: row[3],
    mainKeyword: row[4],
    totalPosts: row[5],
    categoryKeyword1: row[6],
    keyword1Posts: row[7],
    categoryKeyword2: row[8],
    keyword2Posts: row[9],
    categoryKeyword3: row[10],
    keyword3Posts: row[11]
  }));
}
```

**index.html**:
```html
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>키워드 노출량 대시보드</title>
  <!-- standalone.html의 내용을 여기에 복사 -->
  <!-- 단, data-loader-standalone.js 대신 아래 스크립트 사용 -->
  <script>
    const DATA_LOADER = (() => {
      let processedData = { dates: [], stores: [], dataByDate: {}, dataByStore: {} };
      
      async function fetchData() {
        return new Promise((resolve, reject) => {
          google.script.run
            .withSuccessHandler(data => {
              processData(data);
              resolve(processedData);
            })
            .withFailureHandler(reject)
            .getSheetData();
        });
      }
      
      // processData 함수와 나머지 함수들 복사...
      
      return { fetchData, getDataByDate, getDataByStore, calculateWeeklyComparison, getDates, getStores };
    })();
  </script>
</head>
<body>
  <!-- standalone.html의 body 내용 복사 -->
</body>
</html>
```

3. **배포**
   - 배포 → 새 배포
   - 유형: "웹 앱"
   - 액세스 권한:
     - "나만" (본인만)
     - "조직 내 사용자" (회사 내부)
     - "모든 사용자" (공개)
   - 배포 클릭

4. **URL 받기**
   - 배포 완료 후 웹 앱 URL 복사
   - 예: `https://script.google.com/macros/s/XXXXX/exec`

---

## 방법 3: 로컬 파일로 실행 (가장 간단)

### 장점
- ✅ 설치 불필요
- ✅ 즉시 실행 가능
- ✅ 인터넷만 있으면 됨

### 실행 방법

1. **파일 다운로드**
   - 모든 파일을 로컬에 다운로드

2. **standalone.html 열기**
   - `standalone.html` 파일을 더블클릭
   - 브라우저에서 자동으로 열림

3. **CORS 이슈 발생 시**
   - Chrome 브라우저 사용 (권장)
   - 또는 Firefox 브라우저 사용
   - CORS 확장 프로그램 설치:
     - Chrome: "Allow CORS: Access-Control-Allow-Origin"
     - Firefox: "CORS Everywhere"

---

## 방법 4: 간단한 웹 서버 실행

### Python 설치되어 있는 경우

```bash
# 프로젝트 폴더로 이동
cd /path/to/dashboard

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

브라우저에서 접속: `http://localhost:8000/standalone.html`

### Node.js 설치되어 있는 경우

```bash
# http-server 설치 (최초 1회)
npm install -g http-server

# 실행
cd /path/to/dashboard
http-server

# 또는 특정 포트
http-server -p 8080
```

브라우저에서 접속: `http://localhost:8080/standalone.html`

---

## 🔒 보안 설정 (선택사항)

### Google Sheets 접근 제한

1. **구글 시트 공유 설정**
   - 파일 → 공유 → 액세스 변경
   - "링크가 있는 모든 사용자" → "제한됨"으로 변경
   - 필요한 사람만 추가

2. **Apps Script 배포 시**
   - "조직 내 사용자"로 설정
   - 회사 계정으로만 접근 가능

### GitHub Pages 비공개

- GitHub Pro 계정으로 Private Repository 사용
- 또는 Vercel, Netlify의 Password Protection 기능 사용

---

## 📊 CORS 프록시 정보

`standalone.html`은 3개의 CORS 프록시를 자동으로 시도합니다:

1. **allorigins.win** - 무료, 안정적
2. **corsproxy.io** - 무료, 빠름
3. **cors-anywhere** - 백업용

### 자체 CORS 프록시 설정 (고급)

Cloudflare Workers로 자체 프록시 만들기:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')
  
  const response = await fetch(targetUrl)
  const newResponse = new Response(response.body, response)
  
  newResponse.headers.set('Access-Control-Allow-Origin', '*')
  return newResponse
}
```

---

## 🎯 추천 방법 요약

| 상황 | 추천 방법 |
|------|----------|
| 팀과 공유하고 싶다 | GitHub Pages |
| 회사 내부에서만 사용 | Google Apps Script |
| 혼자 사용 | 로컬 파일 |
| 개발자이고 커스텀 필요 | 로컬 웹 서버 |

---

## ❓ 문제 해결

### CORS 에러가 발생해요
- CORS 프록시가 응답하지 않을 수 있습니다
- `data-loader-standalone.js`에서 다른 프록시로 자동 전환됩니다
- 또는 Google Apps Script 방법 사용

### 데이터가 안 보여요
- 구글 시트 공유 설정 확인 ("링크가 있는 모든 사용자")
- 브라우저 콘솔(F12)에서 에러 확인
- 시트 ID가 정확한지 확인

### 업데이트는 어떻게 하나요?
- GitHub Pages: Git push
- Google Apps Script: 새 버전 배포
- 로컬: 파일 교체

---

## 📞 지원

더 자세한 도움이 필요하시면 README.md를 참고하세요.

**선호하는 방법**: GitHub Pages (무료, 안정적, 관리 쉬움) ⭐
