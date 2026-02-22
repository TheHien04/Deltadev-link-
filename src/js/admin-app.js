/**
 * admin-app.js
 * Entry point for admin dashboard
 */

import AdminDashboardManager from './managers/AdminDashboardManager.js';

// Simple AppState for admin (lightweight version)
class AdminAppState {
    constructor() {
        this.state = {
            currentLanguage: 'vi'
        };
    }
    
    get(key) {
        return this.state[key];
    }
    
    set(key, value) {
        this.state[key] = value;
        return this;
    }
}

// Simple config
const APP_CONFIG = {
    appName: 'DeltaDev Link Admin',
    version: '1.0.0'
};

// Initialize admin app
class AdminApp {
    constructor() {
        this.appState = new AdminAppState();
        this.adminManager = null;
    }
    
    async init() {
        console.log('🎯 Admin Dashboard initializing...');
        
        try {
            // Initialize admin dashboard manager
            this.adminManager = new AdminDashboardManager(this.appState, APP_CONFIG);
            this.adminManager.init();
            
            // Expose to window for onclick handlers
            window.adminDashboard = this.adminManager;
            
            // Hide loading indicator
            this.hideLoadingIndicator();
            
            console.log('✅ Admin Dashboard ready!');
        } catch (error) {
            console.error('❌ Admin initialization error:', error);
            this.showError();
        }
    }
    
    hideLoadingIndicator() {
        const loader = document.getElementById('loadingIndicator');
        if (loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.transition = 'opacity 0.3s ease';
                setTimeout(() => loader.remove(), 300);
            }, 500);
        }
    }
    
    showError() {
        const loader = document.getElementById('loadingIndicator');
        if (loader) {
            loader.innerHTML = `
                <div class="text-center">
                    <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p class="text-red-600 font-semibold text-lg mb-2">Lỗi khởi tạo Admin Dashboard</p>
                    <p class="text-gray-600">Vui lòng tải lại trang</p>
                    <button onclick="location.reload()" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Tải lại
                    </button>
                </div>
            `;
        }
    }
}

// Start admin app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new AdminApp();
        app.init();
    });
} else {
    const app = new AdminApp();
    app.init();
}

// Export for debugging
window.AdminApp = AdminApp;
