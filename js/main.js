/**
 * Main Application Controller
 * Initializes and manages the overall application state
 */

(function() {
    let currentTab = 'daily';

    /**
     * Initialize application
     */
    async function init() {
        try {
            showLoading();
            
            // Fetch data from Google Sheets
            await DATA_LOADER.fetchData();
            
            // Initialize dashboards
            DAILY_DASHBOARD.init();
            COMPARISON_DASHBOARD.init();
            
            // Setup UI event listeners
            setupEventListeners();
            
            // Show daily dashboard by default
            switchTab('daily');
            
            // Render charts for comparison dashboard
            COMPARISON_DASHBOARD.renderCharts();
            
            hideLoading();
        } catch (error) {
            console.error('Initialization error:', error);
            showError('데이터를 불러오는 중 오류가 발생했습니다. ' + error.message);
        }
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                switchTab(tab);
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.addEventListener('click', async () => {
            await refreshData();
        });
    }

    /**
     * Switch between tabs
     */
    function switchTab(tab) {
        currentTab = tab;
        
        // Update tab buttons
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            if (btn.getAttribute('data-tab') === tab) {
                btn.classList.add('tab-active');
            } else {
                btn.classList.remove('tab-active');
            }
        });

        // Show/hide dashboards
        const dailyDashboard = document.getElementById('dailyDashboard');
        const comparisonDashboard = document.getElementById('comparisonDashboard');
        
        if (tab === 'daily') {
            dailyDashboard.classList.remove('hidden');
            comparisonDashboard.classList.add('hidden');
        } else if (tab === 'comparison') {
            dailyDashboard.classList.add('hidden');
            comparisonDashboard.classList.remove('hidden');
            // Render charts when switching to comparison tab
            setTimeout(() => {
                COMPARISON_DASHBOARD.renderCharts();
            }, 100);
        }
    }

    /**
     * Refresh data
     */
    async function refreshData() {
        try {
            const refreshBtn = document.getElementById('refreshBtn');
            const icon = refreshBtn.querySelector('i');
            
            // Add spinning animation
            icon.classList.add('fa-spin');
            refreshBtn.disabled = true;
            
            // Fetch fresh data
            await DATA_LOADER.fetchData();
            
            // Refresh current dashboard
            if (currentTab === 'daily') {
                DAILY_DASHBOARD.init();
            } else if (currentTab === 'comparison') {
                COMPARISON_DASHBOARD.refresh();
            }
            
            // Show success message
            showToast('데이터가 새로고침되었습니다.', 'success');
            
        } catch (error) {
            console.error('Refresh error:', error);
            showToast('데이터 새로고침 중 오류가 발생했습니다.', 'error');
        } finally {
            const refreshBtn = document.getElementById('refreshBtn');
            const icon = refreshBtn.querySelector('i');
            icon.classList.remove('fa-spin');
            refreshBtn.disabled = false;
        }
    }

    /**
     * Show loading state
     */
    function showLoading() {
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('errorState').classList.add('hidden');
        document.getElementById('dailyDashboard').classList.add('hidden');
        document.getElementById('comparisonDashboard').classList.add('hidden');
    }

    /**
     * Hide loading state
     */
    function hideLoading() {
        document.getElementById('loadingState').classList.add('hidden');
    }

    /**
     * Show error state
     */
    function showError(message) {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('errorState').classList.remove('hidden');
        document.getElementById('errorMessage').textContent = message;
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast-notification fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slide-up ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        } text-white`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                     type === 'error' ? 'fa-exclamation-circle' : 
                     'fa-info-circle';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transition = 'opacity 0.3s';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Add custom animation for toast
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slide-up {
            from {
                transform: translateY(100px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        .animate-slide-up {
            animation: slide-up 0.3s ease-out;
        }
    `;
    document.head.appendChild(style);
})();
