/**
 * Main Entry Point
 * Initializes the application
 * @module main
 */

import app from './app.js';
import APP_CONFIG from './config/app.config.js';
import { escapeHtml } from './utils/security.js';
import logger from './utils/logger.js';

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

async function initApp() {
    try {
        logger.info('[Main]', `Starting ${APP_CONFIG.app.name}...`);
        await app.init();

        if (logger.enabled) {
            window.__APP__ = app;
            window.__APP_CONFIG__ = APP_CONFIG;
            logger.info('[Main]', 'Debug mode enabled. Access app via window.__APP__');
        }
    } catch (error) {
        logger.error('[Main]', 'CRITICAL ERROR during initialization', error);
        renderFriendlyError(error);
    }
}

function renderFriendlyError(error) {
    const banner = document.createElement('div');
    banner.setAttribute('role', 'alert');
    banner.style.cssText = 'padding:1.5rem;max-width:40rem;margin:2rem auto;background:#fef2f2;border:1px solid #fecaca;border-radius:0.75rem;font-family:system-ui,sans-serif;';
    banner.innerHTML = `
        <h1 style="color:#b91c1c;font-size:1.25rem;margin:0 0 0.5rem;">Something went wrong</h1>
        <p style="color:#7f1d1d;margin:0 0 1rem;">Please refresh the page. If the problem continues, contact us on Zalo.</p>
        <p style="color:#991b1b;font-size:0.875rem;margin:0;">${escapeHtml(error.message || 'Unknown error')}</p>
    `;
    document.body.prepend(banner);
}

window.addEventListener('load', () => {
    document.body.classList.remove('loading');
    document.dispatchEvent(new CustomEvent('appReady'));
});
