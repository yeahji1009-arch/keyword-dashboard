/**
 * Standalone Data Loader
 * Uses CORS proxy to fetch Google Sheets data
 */

const DATA_LOADER = (() => {
    // Google Sheets Configuration
    const SHEET_ID = '1U8WL2QcUY-Ujh8pJW6D4zljvRx1lFQkRH8-PXOReXwg';
    const GID = '0';
    
    // Multiple CORS proxy options (fallback if one fails)
    const PROXY_OPTIONS = [
        `https://api.allorigins.win/raw?url=`,
        `https://corsproxy.io/?`,
        `https://cors-anywhere.herokuapp.com/`
    ];
    
    let currentProxyIndex = 0;
    let rawData = [];
    let processedData = {
        dates: [],
        stores: [],
        dataByDate: {},
        dataByStore: {}
    };

    /**
     * Get current proxy URL
     */
    function getProxyUrl() {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
        return PROXY_OPTIONS[currentProxyIndex] + encodeURIComponent(csvUrl);
    }

    /**
     * Fetch data from Google Sheets with fallback proxies
     */
    async function fetchData() {
        let lastError = null;
        
        // Try each proxy option
        for (let i = 0; i < PROXY_OPTIONS.length; i++) {
            currentProxyIndex = i;
            try {
                console.log(`Attempting to fetch data using proxy ${i + 1}...`);
                const response = await fetch(getProxyUrl(), {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/csv'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const csvText = await response.text();
                
                // Validate CSV content
                if (!csvText || csvText.includes('<!DOCTYPE') || csvText.includes('<html')) {
                    throw new Error('Invalid CSV response');
                }
                
                rawData = parseCSV(csvText);
                
                if (rawData.length === 0) {
                    throw new Error('No data parsed from CSV');
                }
                
                processData();
                console.log(`Successfully loaded data using proxy ${i + 1}`);
                return processedData;
            } catch (error) {
                console.warn(`Proxy ${i + 1} failed:`, error.message);
                lastError = error;
            }
        }
        
        // All proxies failed, throw error
        throw new Error(`모든 데이터 로드 방법이 실패했습니다: ${lastError?.message || 'Unknown error'}`);
    }

    /**
     * Parse CSV text to array
     */
    function parseCSV(text) {
        const lines = text.split('\n');
        const result = [];
        
        // Skip first 3 rows (headers start at row 3)
        for (let i = 3; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = parseCSVLine(line);
            if (values.length >= 6 && values[1]) { // Check if date exists
                result.push({
                    date: values[1],
                    storeName: values[2],
                    platform: values[3],
                    mainKeyword: values[4],
                    totalPosts: parseInt(values[5]) || 0,
                    categoryKeyword1: values[6] || '',
                    keyword1Posts: parseInt(values[7]) || 0,
                    categoryKeyword2: values[8] || '',
                    keyword2Posts: parseInt(values[9]) || 0,
                    categoryKeyword3: values[10] || '',
                    keyword3Posts: parseInt(values[11]) || 0
                });
            }
        }
        
        return result;
    }

    /**
     * Parse a single CSV line handling quoted values
     */
    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        
        return result;
    }

    /**
     * Process raw data into structured format
     */
    function processData() {
        const dateSet = new Set();
        const storeSet = new Set();
        const dataByDate = {};
        const dataByStore = {};

        rawData.forEach(row => {
            // Collect unique dates and stores
            if (row.date) dateSet.add(row.date);
            if (row.storeName) storeSet.add(row.storeName);

            // Group by date
            if (!dataByDate[row.date]) {
                dataByDate[row.date] = {};
            }
            if (!dataByDate[row.date][row.storeName]) {
                dataByDate[row.date][row.storeName] = {
                    naver: [],
                    instagram: []
                };
            }
            
            const platform = row.platform === '네이버' ? 'naver' : 'instagram';
            dataByDate[row.date][row.storeName][platform].push(row);

            // Group by store
            if (!dataByStore[row.storeName]) {
                dataByStore[row.storeName] = {};
            }
            if (!dataByStore[row.storeName][row.date]) {
                dataByStore[row.storeName][row.date] = {
                    naver: [],
                    instagram: []
                };
            }
            dataByStore[row.storeName][row.date][platform].push(row);
        });

        // Sort dates (newest first)
        const sortedDates = Array.from(dateSet).sort((a, b) => {
            const [aMonth, aDay] = a.split('/').map(Number);
            const [bMonth, bDay] = b.split('/').map(Number);
            if (aMonth !== bMonth) return bMonth - aMonth;
            return bDay - aDay;
        });

        processedData = {
            dates: sortedDates,
            stores: Array.from(storeSet),
            dataByDate,
            dataByStore,
            rawData
        };
    }

    /**
     * Get data for a specific date
     */
    function getDataByDate(date) {
        return processedData.dataByDate[date] || {};
    }

    /**
     * Get data for a specific store
     */
    function getDataByStore(storeName) {
        return processedData.dataByStore[storeName] || {};
    }

    /**
     * Calculate week-over-week comparison
     */
    function calculateWeeklyComparison() {
        const comparison = {};
        const dates = processedData.dates;
        
        if (dates.length < 7) {
            console.warn('Not enough data for weekly comparison');
            return comparison;
        }

        // Get last 7 days and previous 7 days
        const lastWeek = dates.slice(0, 7);
        const previousWeek = dates.slice(7, 14);

        processedData.stores.forEach(store => {
            comparison[store] = {
                naver: {},
                instagram: {}
            };

            ['naver', 'instagram'].forEach(platform => {
                const lastWeekData = {};
                const previousWeekData = {};

                // Aggregate last week data
                lastWeek.forEach(date => {
                    const storeData = processedData.dataByStore[store]?.[date]?.[platform] || [];
                    storeData.forEach(row => {
                        if (!lastWeekData[row.mainKeyword]) {
                            lastWeekData[row.mainKeyword] = 0;
                        }
                        lastWeekData[row.mainKeyword] += row.totalPosts;
                    });
                });

                // Aggregate previous week data
                previousWeek.forEach(date => {
                    const storeData = processedData.dataByStore[store]?.[date]?.[platform] || [];
                    storeData.forEach(row => {
                        if (!previousWeekData[row.mainKeyword]) {
                            previousWeekData[row.mainKeyword] = 0;
                        }
                        previousWeekData[row.mainKeyword] += row.totalPosts;
                    });
                });

                // Calculate averages and change rates
                Object.keys({...lastWeekData, ...previousWeekData}).forEach(keyword => {
                    const lastAvg = (lastWeekData[keyword] || 0) / lastWeek.length;
                    const prevAvg = (previousWeekData[keyword] || 0) / previousWeek.length;
                    const change = prevAvg === 0 ? 
                        (lastAvg > 0 ? 100 : 0) : 
                        ((lastAvg - prevAvg) / prevAvg) * 100;

                    comparison[store][platform][keyword] = {
                        lastWeekAvg: lastAvg,
                        previousWeekAvg: prevAvg,
                        changeRate: change,
                        lastWeekTotal: lastWeekData[keyword] || 0,
                        previousWeekTotal: previousWeekData[keyword] || 0
                    };
                });
            });
        });

        return comparison;
    }

    /**
     * Get all available dates
     */
    function getDates() {
        return processedData.dates;
    }

    /**
     * Get all stores
     */
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
