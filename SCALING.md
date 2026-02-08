# 📊 대규모 확장 가이드

## 현재 자동 확장 기능

### ✅ 완전 자동 확장
- **지점 추가**: 구글 시트에 새 지점 데이터만 입력하면 자동으로 대시보드에 표시
- **키워드 추가**: 새 키워드도 자동으로 인식
- **날짜 추가**: 매일 데이터를 추가하면 자동으로 날짜 드롭다운에 추가

### 코드 수정 불필요!
```
구글 시트에 데이터 입력 → 새로고침 버튼 클릭 → 완료! 🎉
```

---

## 📊 규모별 성능 가이드

### 🟢 소규모 (권장 범위)
- **지점 수**: 1~20개
- **데이터 행**: ~5,000행
- **성능**: 매우 빠름 (1초 이내)
- **조치 사항**: 없음

### 🟡 중규모 (최적화 권장)
- **지점 수**: 20~50개
- **데이터 행**: 5,000~10,000행
- **성능**: 보통 (2~3초)
- **조치 사항**: 아래 최적화 옵션 고려

### 🔴 대규모 (최적화 필수)
- **지점 수**: 50개 이상
- **데이터 행**: 10,000행 이상
- **성능**: 느림 (5초 이상)
- **조치 사항**: 반드시 최적화 적용

---

## 🚀 성능 최적화 옵션

### 옵션 1: 지점 필터 기능 추가

대시보드에 지점 선택 기능을 추가하여 한 번에 표시되는 지점 수를 제한합니다.

**구현 코드 (index.html 또는 standalone.html에 추가)**:

```html
<!-- Date Selector 아래에 추가 -->
<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
    <label class="block text-sm font-semibold text-gray-700 mb-2">
        <i class="fas fa-filter mr-2"></i>지점 필터
    </label>
    <div class="flex flex-wrap gap-2">
        <button id="filterAll" class="filter-btn active px-4 py-2 rounded-lg bg-blue-500 text-white">
            전체
        </button>
        <!-- 지점별 필터 버튼이 자동으로 생성됨 -->
        <div id="storeFilterButtons" class="flex flex-wrap gap-2"></div>
    </div>
</div>
```

**JavaScript 추가 (js/dashboard-daily.js에 추가)**:

```javascript
// 지점 필터 기능
let selectedStores = null; // null = 전체, 배열 = 선택된 지점들

function initStoreFilter() {
    const container = document.getElementById('storeFilterButtons');
    const stores = DATA_LOADER.getStores();
    
    stores.forEach(store => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn px-4 py-2 rounded-lg border border-gray-300 hover:bg-blue-50';
        btn.textContent = store;
        btn.onclick = () => toggleStoreFilter(store, btn);
        container.appendChild(btn);
    });
    
    // 전체 버튼
    document.getElementById('filterAll').onclick = () => {
        selectedStores = null;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active', 'bg-blue-500', 'text-white'));
        document.getElementById('filterAll').classList.add('active', 'bg-blue-500', 'text-white');
        renderDailyData(currentDate);
    };
}

function toggleStoreFilter(store, btn) {
    if (!selectedStores) selectedStores = [];
    
    const index = selectedStores.indexOf(store);
    if (index > -1) {
        selectedStores.splice(index, 1);
        btn.classList.remove('active', 'bg-blue-500', 'text-white');
    } else {
        selectedStores.push(store);
        btn.classList.add('active', 'bg-blue-500', 'text-white');
    }
    
    document.getElementById('filterAll').classList.remove('active', 'bg-blue-500', 'text-white');
    renderDailyData(currentDate);
}

// renderDailyData 함수 수정
function renderDailyData(date) {
    const container = document.getElementById('storeCardsContainer');
    const data = DATA_LOADER.getDataByDate(date);
    let stores = DATA_LOADER.getStores();
    
    // 필터 적용
    if (selectedStores && selectedStores.length > 0) {
        stores = stores.filter(s => selectedStores.includes(s));
    }
    
    container.innerHTML = '';
    
    stores.forEach(store => {
        if (!data[store]) return;
        const card = createStoreCard(store, data[store], date);
        container.appendChild(card);
    });
}
```

---

### 옵션 2: 페이지네이션 추가

한 페이지에 표시되는 지점 수를 제한합니다 (예: 10개씩).

**구현 예시**:

```javascript
const STORES_PER_PAGE = 10;
let currentPage = 1;

function renderDailyDataWithPagination(date) {
    const stores = DATA_LOADER.getStores();
    const totalPages = Math.ceil(stores.length / STORES_PER_PAGE);
    const startIndex = (currentPage - 1) * STORES_PER_PAGE;
    const endIndex = startIndex + STORES_PER_PAGE;
    const storesOnPage = stores.slice(startIndex, endIndex);
    
    // storesOnPage만 렌더링
    // 페이지네이션 버튼 추가
}
```

---

### 옵션 3: 가상 스크롤링 (고급)

화면에 보이는 카드만 렌더링하여 성능을 대폭 향상시킵니다.

라이브러리 사용:
```html
<script src="https://cdn.jsdelivr.net/npm/virtual-scroller@1.11.5/dist/virtual-scroller.min.js"></script>
```

---

### 옵션 4: 데이터 분리 (가장 효과적)

구글 시트를 여러 개로 분리하여 관리합니다.

**시트 구조 예시**:
```
1. 키워드_데이터_2026_02 (월별 시트)
2. 키워드_데이터_2026_01
3. 키워드_데이터_2025_12
```

**대시보드에서 월 선택 기능 추가**:
```html
<select id="monthSelector">
    <option value="2026_02">2026년 2월</option>
    <option value="2026_01">2026년 1월</option>
</select>
```

---

## 🎯 권장 전략

### 현재 상황 (7개 지점)
→ **조치 불필요** ✅  
현재 코드로 완벽하게 동작합니다.

### 10~30개 지점으로 확장 시
→ **옵션 1: 지점 필터 추가** 권장  
사용자가 원하는 지점만 선택해서 볼 수 있습니다.

### 30~50개 지점으로 확장 시
→ **옵션 1 + 옵션 2 조합** 권장  
필터 + 페이지네이션으로 성능 최적화

### 50개 이상으로 확장 시
→ **옵션 4: 데이터 분리** 권장  
월별 또는 분기별로 시트를 분리하여 관리

---

## 💡 실무 팁

### 성능 모니터링
브라우저 콘솔(F12)에서 성능 측정:
```javascript
console.time('데이터 로드');
await DATA_LOADER.fetchData();
console.timeEnd('데이터 로드');
```

### 캐싱 활용
자주 변경되지 않는 데이터는 localStorage에 캐싱:
```javascript
// 데이터 저장
localStorage.setItem('dashboard_data', JSON.stringify(data));

// 데이터 불러오기
const cachedData = JSON.parse(localStorage.getItem('dashboard_data'));
```

### 점진적 로딩
초기에는 최신 7일만 로드하고, 필요시 더 많은 데이터 로드:
```javascript
// 최근 7일 데이터만 먼저 표시
// "더 보기" 버튼으로 추가 데이터 로드
```

---

## 📊 예상 성능

### 현재 구조 (최적화 없음)

| 지점 수 | 데이터 행 | 로딩 시간 | 렌더링 시간 |
|---------|-----------|-----------|-------------|
| 7개     | 500행     | 0.5초     | 0.2초       |
| 20개    | 2,000행   | 1초       | 0.5초       |
| 50개    | 5,000행   | 2초       | 1초         |
| 100개   | 10,000행  | 4초       | 2초         |

### 필터 적용 후

| 지점 수 | 선택 지점 | 로딩 시간 | 렌더링 시간 |
|---------|-----------|-----------|-------------|
| 100개   | 5개 선택  | 4초       | 0.1초       |
| 100개   | 10개 선택 | 4초       | 0.3초       |

### 데이터 분리 후

| 월별 시트 | 지점 수 | 로딩 시간 | 렌더링 시간 |
|-----------|---------|-----------|-------------|
| 1개월     | 100개   | 1초       | 1초         |
| 1개월     | 200개   | 2초       | 2초         |

---

## 🔧 최적화 구현 서비스

지점이 많이 늘어나서 최적화가 필요하시면:
1. 필요한 옵션 선택
2. 구체적인 요구사항 공유
3. 맞춤 코드 제공

**현재는 최적화 불필요합니다!** 🎉  
데이터가 늘어나면 언제든 다시 말씀해주세요!

---

## 📞 문의

"지점이 XX개로 늘어났어요!" → 즉시 최적화 코드 제공  
"데이터가 느려요!" → 성능 분석 및 개선 방안 제시

**현재 7개 지점: 완벽하게 동작합니다!** ✅
