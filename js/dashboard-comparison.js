/**
 * Dashboard 2: Weekly Comparison Dashboard
 * Shows week-over-week comparison by store
 */

const COMPARISON_DASHBOARD = (() => {
    let chartInstances = {};

    /**
     * Initialize comparison dashboard
     */
    function init() {
        renderComparison();
    }

    /**
     * Render weekly comparison data
     */
    function renderComparison() {
        const container = document.getElementById('comparisonCardsContainer');
        const comparisonData = DATA_LOADER.calculateWeeklyComparison();
        const stores = DATA_LOADER.getStores();
        
        container.innerHTML = '';

        if (Object.keys(comparisonData).length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-inbox text-5xl mb-4"></i>
                    <p class="text-lg">충분한 데이터가 없습니다.</p>
                    <p class="text-sm mt-2">최소 14일의 데이터가 필요합니다.</p>
                </div>
            `;
            return;
        }

        stores.forEach(store => {
            if (!comparisonData[store]) return;
            
            const card = createComparisonCard(store, comparisonData[store]);
            container.appendChild(card);
        });
    }

    /**
     * Create comparison card for a store
     */
    function createComparisonCard(storeName, storeData) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md overflow-hidden';

        const naverKeywords = Object.keys(storeData.naver || {});
        const instagramKeywords = Object.keys(storeData.instagram || {});

        card.innerHTML = `
            <div class="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4">
                <h2 class="text-xl font-bold flex items-center">
                    <i class="fas fa-store mr-2"></i>
                    ${storeName}
                </h2>
                <p class="text-purple-100 text-sm mt-1">
                    <i class="fas fa-chart-line mr-1"></i>
                    전주 대비 증감률 분석
                </p>
            </div>
            
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${naverKeywords.length > 0 ? createPlatformComparison('네이버', 'naver', storeName, storeData.naver) : ''}
                    ${instagramKeywords.length > 0 ? createPlatformComparison('인스타그램', 'instagram', storeName, storeData.instagram) : ''}
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Create platform comparison section
     */
    function createPlatformComparison(platformName, platformType, storeName, data) {
        const platformClass = platformType === 'naver' ? 'platform-badge-naver' : 'platform-badge-instagram';
        const chartId = `chart-${storeName}-${platformType}`.replace(/\s+/g, '-');
        
        const keywords = Object.keys(data);
        
        return `
            <div class="platform-comparison">
                <div class="flex items-center mb-4">
                    <span class="${platformClass} text-white text-xs font-semibold px-3 py-1 rounded-full">
                        ${platformName}
                    </span>
                </div>
                
                <div class="space-y-3 mb-6">
                    ${keywords.map(keyword => createComparisonRow(keyword, data[keyword])).join('')}
                </div>
                
                <div class="mt-4">
                    <canvas id="${chartId}" style="height: 250px;"></canvas>
                </div>
            </div>
        `;
    }

    /**
     * Create comparison row for a keyword
     */
    function createComparisonRow(keyword, data) {
        const changeRate = data.changeRate;
        const isIncrease = changeRate > 0;
        const isDecrease = changeRate < 0;
        const changeClass = isIncrease ? 'increase' : isDecrease ? 'decrease' : 'text-gray-500';
        const icon = isIncrease ? '↑' : isDecrease ? '↓' : '→';
        const bgClass = isIncrease ? 'bg-green-50' : isDecrease ? 'bg-red-50' : 'bg-gray-50';
        
        return `
            <div class="${bgClass} rounded-lg p-4 border ${isIncrease ? 'border-green-200' : isDecrease ? 'border-red-200' : 'border-gray-200'}">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold text-gray-800 text-sm flex-1">${keyword}</h4>
                    <span class="${changeClass} font-bold text-lg ml-2">
                        ${icon} ${Math.abs(changeRate).toFixed(1)}%
                    </span>
                </div>
                
                <div class="grid grid-cols-2 gap-3 text-xs">
                    <div>
                        <p class="text-gray-500 mb-1">최근 주 평균</p>
                        <p class="font-semibold text-gray-800">${data.lastWeekAvg.toFixed(1)} 회</p>
                        <p class="text-gray-400 text-xs mt-0.5">총 ${data.lastWeekTotal}회</p>
                    </div>
                    <div>
                        <p class="text-gray-500 mb-1">전주 평균</p>
                        <p class="font-semibold text-gray-800">${data.previousWeekAvg.toFixed(1)} 회</p>
                        <p class="text-gray-400 text-xs mt-0.5">총 ${data.previousWeekTotal}회</p>
                    </div>
                </div>
                
                <!-- Progress bar -->
                <div class="mt-3 relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div class="${isIncrease ? 'bg-green-500' : isDecrease ? 'bg-red-500' : 'bg-gray-400'} h-full rounded-full transition-all duration-500" 
                         style="width: ${Math.min(Math.abs(changeRate), 100)}%">
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render charts for all stores
     */
    function renderCharts() {
        // Destroy existing charts
        Object.values(chartInstances).forEach(chart => chart.destroy());
        chartInstances = {};

        const comparisonData = DATA_LOADER.calculateWeeklyComparison();
        const stores = DATA_LOADER.getStores();

        stores.forEach(store => {
            if (!comparisonData[store]) return;
            
            ['naver', 'instagram'].forEach(platform => {
                const data = comparisonData[store][platform];
                if (!data || Object.keys(data).length === 0) return;

                const chartId = `chart-${store}-${platform}`.replace(/\s+/g, '-');
                const canvas = document.getElementById(chartId);
                
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    const keywords = Object.keys(data);
                    const lastWeekData = keywords.map(k => data[k].lastWeekAvg);
                    const previousWeekData = keywords.map(k => data[k].previousWeekAvg);

                    chartInstances[chartId] = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: keywords,
                            datasets: [
                                {
                                    label: '최근 주 평균',
                                    data: lastWeekData,
                                    backgroundColor: platform === 'naver' ? 'rgba(3, 199, 90, 0.7)' : 'rgba(188, 24, 136, 0.7)',
                                    borderColor: platform === 'naver' ? 'rgba(3, 199, 90, 1)' : 'rgba(188, 24, 136, 1)',
                                    borderWidth: 1
                                },
                                {
                                    label: '전주 평균',
                                    data: previousWeekData,
                                    backgroundColor: 'rgba(156, 163, 175, 0.5)',
                                    borderColor: 'rgba(156, 163, 175, 1)',
                                    borderWidth: 1
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: true,
                                    position: 'top',
                                    labels: {
                                        font: {
                                            size: 11
                                        },
                                        padding: 10
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '회';
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        font: {
                                            size: 10
                                        }
                                    }
                                },
                                x: {
                                    ticks: {
                                        font: {
                                            size: 9
                                        },
                                        maxRotation: 45,
                                        minRotation: 45
                                    }
                                }
                            }
                        }
                    });
                }
            });
        });
    }

    /**
     * Refresh comparison dashboard
     */
    function refresh() {
        renderComparison();
        // Wait for DOM to update before rendering charts
        setTimeout(() => {
            renderCharts();
        }, 100);
    }

    return {
        init,
        refresh,
        renderCharts
    };
})();
