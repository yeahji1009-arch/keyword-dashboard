/**
 * Dashboard 1: Daily Keyword Exposure Dashboard
 */

const DAILY_DASHBOARD = (() => {
    let currentDate = null;

    /**
     * Initialize daily dashboard
     */
    function init() {
        setupDateSelector();
        setupEventListeners();
    }

    /**
     * Setup date selector dropdown
     */
    function setupDateSelector() {
        const dateSelector = document.getElementById('dateSelector');
        const dates = DATA_LOADER.getDates();
        
        // Clear existing options except first one
        dateSelector.innerHTML = '<option value="">날짜를 선택하세요</option>';
        
        dates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = `2026/${date}`;
            dateSelector.appendChild(option);
        });

        // Select first date by default
        if (dates.length > 0) {
            dateSelector.value = dates[0];
            currentDate = dates[0];
            renderDailyData(currentDate);
        }
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        const dateSelector = document.getElementById('dateSelector');
        dateSelector.addEventListener('change', (e) => {
            currentDate = e.target.value;
            if (currentDate) {
                renderDailyData(currentDate);
            }
        });
    }

    /**
     * Render daily data for selected date
     */
    function renderDailyData(date) {
        const container = document.getElementById('storeCardsContainer');
        const data = DATA_LOADER.getDataByDate(date);
        const stores = DATA_LOADER.getStores();
        
        container.innerHTML = '';

        if (Object.keys(data).length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12 text-gray-500">
                    <i class="fas fa-inbox text-5xl mb-4"></i>
                    <p class="text-lg">선택한 날짜에 데이터가 없습니다.</p>
                </div>
            `;
            return;
        }

        stores.forEach(store => {
            if (!data[store]) return;
            
            const card = createStoreCard(store, data[store], date);
            container.appendChild(card);
        });
    }

    /**
     * Create store card element
     */
    function createStoreCard(storeName, storeData, date) {
        const card = document.createElement('div');
        card.className = 'store-card bg-white rounded-lg shadow-md overflow-hidden';

        const naverData = storeData.naver || [];
        const instagramData = storeData.instagram || [];

        card.innerHTML = `
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
                <h2 class="text-xl font-bold flex items-center">
                    <i class="fas fa-store mr-2"></i>
                    ${storeName}
                </h2>
                <p class="text-blue-100 text-sm mt-1">
                    <i class="fas fa-calendar-alt mr-1"></i>
                    2026/${date}
                </p>
            </div>
            
            <div class="p-6 space-y-6">
                ${naverData.length > 0 ? createPlatformSection('네이버', 'naver', naverData) : ''}
                ${instagramData.length > 0 ? createPlatformSection('인스타그램', 'instagram', instagramData) : ''}
                ${naverData.length === 0 && instagramData.length === 0 ? '<p class="text-gray-500 text-center py-4">데이터가 없습니다.</p>' : ''}
            </div>
        `;

        return card;
    }

    /**
     * Create platform section (Naver or Instagram)
     */
    function createPlatformSection(platformName, platformType, data) {
        const platformClass = platformType === 'naver' ? 'platform-badge-naver' : 'platform-badge-instagram';
        
        return `
            <div class="platform-section">
                <div class="flex items-center mb-3">
                    <span class="${platformClass} text-white text-xs font-semibold px-3 py-1 rounded-full">
                        ${platformName}
                    </span>
                    <span class="ml-2 text-sm text-gray-500">
                        ${data.length}개 키워드
                    </span>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="keyword-table w-full border-collapse">
                        <thead>
                            <tr>
                                <th class="text-left">Main 키워드</th>
                                <th class="text-center w-24">노출량</th>
                                ${platformType === 'naver' ? '<th class="text-left">카테고리 키워드</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(row => createKeywordRow(row, platformType)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Create keyword row
     */
    function createKeywordRow(row, platformType) {
        const totalClass = row.totalPosts > 0 ? 'text-blue-600 font-semibold' : 'text-gray-400';
        
        let categoryKeywords = '';
        if (platformType === 'naver') {
            const categories = [];
            if (row.categoryKeyword1 && row.categoryKeyword1 !== '-') {
                categories.push(`${row.categoryKeyword1} (${row.keyword1Posts})`);
            }
            if (row.categoryKeyword2 && row.categoryKeyword2 !== '-') {
                categories.push(`${row.categoryKeyword2} (${row.keyword2Posts})`);
            }
            if (row.categoryKeyword3 && row.categoryKeyword3 !== '-') {
                categories.push(`${row.categoryKeyword3} (${row.keyword3Posts})`);
            }
            categoryKeywords = `<td class="text-gray-600 text-sm">${categories.length > 0 ? categories.join(' / ') : '-'}</td>`;
        }

        return `
            <tr class="hover:bg-gray-50 transition">
                <td class="font-medium text-gray-800">${row.mainKeyword}</td>
                <td class="text-center ${totalClass}">
                    ${row.totalPosts > 0 ? `<span class="inline-flex items-center justify-center bg-blue-50 px-3 py-1 rounded-full">${row.totalPosts}</span>` : '0'}
                </td>
                ${categoryKeywords}
            </tr>
        `;
    }

    /**
     * Refresh dashboard with current date
     */
    function refresh() {
        if (currentDate) {
            renderDailyData(currentDate);
        }
    }

    return {
        init,
        refresh
    };
})();
