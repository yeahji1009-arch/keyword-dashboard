// 구글 시트 데이터를 자동으로 로드하는 모듈 (CORS 우회 강화 버전)
const DATA_LOADER = (() => {
    let processedData = {
        dates: [],
        stores: [],
        dataByDate: {},
        dataByStore: {}
    };

    const SHEET_ID = '1U8WL2QcUY-Ujh8pJW6D4zljvRx1lFQkRH8-PXOReXwg';
    const SHEET_GID = '0';
    
    // 여러 CORS 프록시 옵션 (더 많이 추가)
    const CORS_PROXIES = [
        // 방법 1: 직접 CSV 다운로드 (프록시 없이)
        {
            name: 'Direct CSV',
            getUrl: () => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`
        },
        // 방법 2: AllOrigins
        {
            name: 'AllOrigins',
            getUrl: () => `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`)}`
        },
        // 방법 3: CORS Anywhere (Heroku)
        {
            name: 'CORS Anywhere',
            getUrl: () => `https://cors-anywhere.herokuapp.com/https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`
        },
        // 방법 4: ThingProxy
        {
            name: 'ThingProxy',
            getUrl: () => `https://thingproxy.freeboard.io/fetch/https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`
        },
        // 방법 5: Cloudflare Workers (public)
        {
            name: 'Cloudflare',
            getUrl: () => `https://corsproxy.io/?${encodeURIComponent(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`)}`
        },
        // 방법 6: Google Apps Script 방식
        {
            name: 'Google TSV',
            getUrl: () => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=tsv&gid=${SHEET_GID}`,
            isTSV: true
        }
    ];

    // 데이터 로드 (여러 프록시 자동 시도)
    async function fetchData() {
        console.log('🔄 데이터 로드 시작...');
        
        for (let i = 0; i < CORS_PROXIES.length; i++) {
            const proxy = CORS_PROXIES[i];
            try {
                console.log(`시도 ${i + 1}/${CORS_PROXIES.length}: ${proxy.name}`);
                
                const url = proxy.getUrl();
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/csv, text/plain, */*'
                    },
                    mode: 'cors',
                    cache: 'no-cache'
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const text = await response.text();
                
                // 빈 응답 체크
                if (!text || text.trim().length === 0) {
                    throw new Error('빈 응답');
                }

                // HTML 에러 페이지 체크
                if (text.includes('<!DOCTYPE') || text.includes('<html')) {
                    throw new Error('HTML 에러 페이지 반환됨');
                }

                console.log(`✅ ${proxy.name} 성공!`);
                console.log(`📊 데이터 크기: ${text.length} bytes`);
                
                const rawData = proxy.isTSV ? parseTSV(text) : parseCSV(text);
                
                if (rawData.length === 0) {
                    throw new Error('파싱된 데이터가 없음');
                }
                
                processData(rawData);
                console.log(`✨ 처리 완료: ${rawData.length}개 행, ${processedData.dates.length}개 날짜, ${processedData.stores.length}개 지점`);
                
                return processedData;

            } catch (error) {
                console.warn(`❌ ${proxy.name} 실패:`, error.message);
                
                // 마지막 시도였다면 에러 던지기
                if (i === CORS_PROXIES.length - 1) {
                    throw new Error(`모든 프록시 시도 실패. 마지막 에러: ${error.message}`);
                }
                
                // 다음 프록시 시도 전 잠깐 대기
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    }

    // CSV 파싱
    function parseCSV(csvText) {
        const lines = csvText.split('\n');
        const data = [];
        
        // 헤더는 4번째 줄(인덱스 3)
        // 데이터는 5번째 줄(인덱스 4)부터
        for (let i = 4; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const columns = parseCSVLine(line);
            
            // 최소 12개 컬럼 필요
            if (columns.length >= 12) {
                // 데이터 유효성 검사
                const storeName = columns[2]?.trim();
                const platform = columns[3]?.trim();
                
                if (storeName && platform) {
                    data.push({
                        date: columns[1]?.trim() || '',
                        storeName: storeName,
                        platform: platform,
                        mainKeyword: columns[4]?.trim() || '',
                        totalPosts: parseInt(columns[5]) || 0,
                        categoryKeyword1: columns[6]?.trim() || '',
                        keyword1Posts: parseInt(columns[7]) || 0,
                        categoryKeyword2: columns[8]?.trim() || '',
                        keyword2Posts: parseInt(columns[9]) || 0,
                        categoryKeyword3: columns[10]?.trim() || '',
                        keyword3Posts: parseInt(columns[11]) || 0
                    });
                }
            }
        }
        
        return data;
    }

    // TSV 파싱
    function parseTSV(tsvText) {
        const lines = tsvText.split('\n');
        const data = [];
        
        for (let i = 4; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const columns = line.split('\t');
            
            if (columns.length >= 12) {
                const storeName = columns[2]?.trim();
                const platform = columns[3]?.trim();
                
                if (storeName && platform) {
                    data.push({
                        date: columns[1]?.trim() || '',
                        storeName: storeName,
                        platform: platform,
                        mainKeyword: columns[4]?.trim() || '',
                        totalPosts: parseInt(columns[5]) || 0,
                        categoryKeyword1: columns[6]?.trim() || '',
                        keyword1Posts: parseInt(columns[7]) || 0,
                        categoryKeyword2: columns[8]?.trim() || '',
                        keyword2Posts: parseInt(columns[9]) || 0,
                        categoryKeyword3: columns[10]?.trim() || '',
                        keyword3Posts: parseInt(columns[11]) || 0
                    });
                }
            }
        }
        
        return data;
    }

    // CSV 한 줄 파싱 (따옴표 처리)
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // 연속된 따옴표는 하나의 따옴표로
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    // 데이터 가공
    function processData(rawData) {
        const uniqueDates = new Set();
        const uniqueStores = new Set();
        const byDate = {};
        const byStore = {};

        rawData.forEach(row => {
            const dateStr = row.date;
            const storeName = row.storeName;
            
            if (!dateStr || !storeName) return;

            uniqueDates.add(dateStr);
            uniqueStores.add(storeName);

            if (!byDate[dateStr]) byDate[dateStr] = [];
            byDate[dateStr].push(row);

            if (!byStore[storeName]) byStore[storeName] = [];
            byStore[storeName].push(row);
        });

        // 날짜 정렬 (최신순)
        processedData.dates = Array.from(uniqueDates).sort((a, b) => {
            const dateA = parseDateString(a);
            const dateB = parseDateString(b);
            return dateB - dateA;
        });

        processedData.stores = Array.from(uniqueStores).sort();
        processedData.dataByDate = byDate;
        processedData.dataByStore = byStore;
    }

    // 날짜 문자열을 Date 객체로 변환
    function parseDateString(dateStr) {
        const parts = dateStr.split('/');
        if (parts.length === 2) {
            const month = parseInt(parts[0]);
            const day = parseInt(parts[1]);
            return new Date(2024, month - 1, day);
        }
        return new Date(dateStr);
    }

    // 전주 대비 증감률 계산
    function calculateWeeklyComparison() {
        const result = {};
        const sortedDates = [...processedData.dates].sort((a, b) => {
            return parseDateString(b) - parseDateString(a);
        });

        if (sortedDates.length < 7) {
            console.warn('7일 이상의 데이터가 필요합니다.');
            return result;
        }

        const recentWeek = sortedDates.slice(0, 7);
        const previousWeek = sortedDates.slice(7, 14);

        processedData.stores.forEach(storeName => {
            const storeData = processedData.dataByStore[storeName] || [];

            const recentData = storeData.filter(row => 
                recentWeek.includes(row.date)
            );

            const previousData = storeData.filter(row => 
                previousWeek.includes(row.date)
            );

            const keywordStats = {};

            const processWeekData = (data, isRecent) => {
                data.forEach(row => {
                    const platform = row.platform;
                    const mainKeyword = row.mainKeyword;
                    const key = `${platform}_${mainKeyword}`;

                    if (!keywordStats[key]) {
                        keywordStats[key] = {
                            platform,
                            mainKeyword,
                            recentTotal: 0,
                            recentCount: 0,
                            previousTotal: 0,
                            previousCount: 0
                        };
                    }

                    const totalPosts = row.totalPosts || 0;
                    if (isRecent) {
                        keywordStats[key].recentTotal += totalPosts;
                        keywordStats[key].recentCount++;
                    } else {
                        keywordStats[key].previousTotal += totalPosts;
                        keywordStats[key].previousCount++;
                    }
                });
            };

            processWeekData(recentData, true);
            processWeekData(previousData, false);

            const comparisons = Object.values(keywordStats).map(stat => {
                const recentAvg = stat.recentCount > 0 
                    ? stat.recentTotal / stat.recentCount 
                    : 0;
                const previousAvg = stat.previousCount > 0 
                    ? stat.previousTotal / stat.previousCount 
                    : 0;

                let changePercent = 0;
                if (previousAvg > 0) {
                    changePercent = ((recentAvg - previousAvg) / previousAvg) * 100;
                } else if (recentAvg > 0) {
                    changePercent = 100;
                }

                return {
                    platform: stat.platform,
                    mainKeyword: stat.mainKeyword,
                    recentAvg: Math.round(recentAvg),
                    previousAvg: Math.round(previousAvg),
                    changePercent: Math.round(changePercent * 10) / 10
                };
            });

            if (comparisons.length > 0) {
                result[storeName] = comparisons;
            }
        });

        return result;
    }

    // Public API
    function getDataByDate(date) {
        return processedData.dataByDate[date] || [];
    }

    function getDataByStore(storeName) {
        return processedData.dataByStore[storeName] || [];
    }

    function getDates() {
        return processedData.dates;
    }

    function getStores() {
        return processedData.stores;
    }

    return {
        fetchData,
        getDataByDate,
        getDataByStore,
        calculateWeeklyComparison,
        getDates,
        getStores
    };
})();
