/**
 * admin-app.js
 * Entry point for the demo admin dashboard.
 * Auth here is a client-side lock screen only — not production security.
 */

import AdminDashboardManager from './managers/AdminDashboardManager.js';
import {
    hasValidAdminSession,
    verifyAdminPassword,
    persistAdminSession,
    clearAdminSession
} from './utils/admin-auth.js';
import { escapeHtml } from './utils/security.js';

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

const APP_CONFIG = {
    appName: 'DeltaDev Link Admin',
    version: '3.2.1'
};

class AdminApp {
    constructor() {
        this.appState = new AdminAppState();
        this.adminManager = null;
    }

    async init() {
        if (!hasValidAdminSession()) {
            this.hideLoadingIndicator(true);
            this.renderLogin();
            return;
        }

        await this.startDashboard();
    }

    async startDashboard() {
        try {
            localStorage.setItem('adminAuthenticated', 'true');
            this.adminManager = new AdminDashboardManager(this.appState, APP_CONFIG);
            this.adminManager.init();
            window.adminDashboard = this.adminManager;
            this.hideLoadingIndicator();
        } catch (error) {
            this.showError(error);
        }
    }

    renderLogin() {
        const host = document.getElementById('adminContent') || document.body;
        host.innerHTML = `
            <main class="min-h-screen flex items-center justify-center bg-slate-900 px-4">
                <form id="adminLoginForm" class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
                    <div>
                        <p class="text-sm font-semibold text-red-700 uppercase tracking-wider">DeltaDev Link</p>
                        <h1 class="text-2xl font-bold text-slate-900 mt-1">Admin sign-in</h1>
                        <p class="text-sm text-slate-500 mt-2">This is a frontend demo lock. It is not a production authentication system.</p>
                    </div>
                    <label class="block">
                        <span class="text-sm font-medium text-slate-700">Password</span>
                        <input id="adminPassword" type="password" autocomplete="current-password" required
                               class="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600">
                    </label>
                    <p id="adminLoginError" class="hidden text-sm text-red-600" role="alert"></p>
                    <button type="submit" class="w-full rounded-lg bg-red-700 text-white font-semibold py-3 hover:bg-red-800">
                        Continue
                    </button>
                </form>
            </main>
        `;

        document.getElementById('adminLoginForm')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const password = document.getElementById('adminPassword')?.value || '';
            const errorEl = document.getElementById('adminLoginError');
            const ok = await verifyAdminPassword(password);
            if (!ok) {
                if (errorEl) {
                    errorEl.textContent = 'Incorrect password.';
                    errorEl.classList.remove('hidden');
                }
                return;
            }
            persistAdminSession();
            window.location.reload();
        });
    }

    hideLoadingIndicator(immediate = false) {
        const loader = document.getElementById('loadingIndicator');
        if (!loader) return;
        if (immediate) {
            loader.remove();
            return;
        }
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.3s ease';
        setTimeout(() => loader.remove(), 300);
    }

    showError(error) {
        const loader = document.getElementById('loadingIndicator') || document.getElementById('adminContent');
        if (!loader) return;
        loader.innerHTML = `
            <div class="text-center p-8">
                <p class="text-red-600 font-semibold text-lg mb-2">Admin dashboard failed to load</p>
                <p class="text-gray-600 mb-4">${escapeHtml(error?.message || 'Unknown error')}</p>
                <button type="button" onclick="location.reload()" class="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Reload
                </button>
                <button type="button" id="adminSignOut" class="mt-2 ml-2 px-6 py-2 bg-gray-200 rounded-lg">
                    Sign out
                </button>
            </div>
        `;
        document.getElementById('adminSignOut')?.addEventListener('click', () => {
            clearAdminSession();
            window.location.reload();
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AdminApp().init());
} else {
    new AdminApp().init();
}
