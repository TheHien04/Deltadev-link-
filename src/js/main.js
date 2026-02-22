/**
 * Main Entry Point
 * Initializes the application
 * @module main
 */

import app from './app.js';
import APP_CONFIG from './config/app.config.js';

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

/**
 * Initialize application
 */
async function initApp() {
    try {
        console.log(`%c🚀 Starting ${APP_CONFIG.app.name}...`, 'color: #C41E3A; font-size: 16px;');
        
        await app.init();
        
        // Make app instance available globally for debugging
        window.__APP__ = app;
        window.__APP_CONFIG__ = APP_CONFIG;
        console.log('%c💡 Debug mode enabled. Access app via window.__APP__', 'color: #F39C12;');
        console.log('%c✅ Initialization Complete!', 'color: #22c55e; font-weight: bold;');
        
    } catch (error) {
        console.error('%c❌ CRITICAL ERROR during initialization', 'color: #ef4444; font-size: 16px; font-weight: bold;');
        console.error('[Main] Error message:', error.message);
        console.error('[Main] Error stack:', error.stack);
        
        // Show error on page for easier debugging
        document.body.innerHTML = `
            <div style="padding: 2rem; max-width: 900px; margin: 2rem auto; background: #fef2f2; border: 3px solid #ef4444; border-radius: 0.75rem; box-shadow: 0 10px 40px rgba(239, 68, 68, 0.2);">
                <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 2rem;">❌ Initialization Error</h1>
                <p style="color: #991b1b; margin-bottom: 1rem; font-size: 1.1rem;"><strong>Error Message:</strong></p>
                <pre style="background: white; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-size: 0.9rem; color: #dc2626; font-weight: bold; margin-bottom: 1.5rem; border: 1px solid #fca5a5;">${error.message}</pre>
                <p style="color: #991b1b; margin-bottom: 0.5rem; font-weight: bold;">Stack Trace:</p>
                <pre style="background: white; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-size: 0.75rem; max-height: 300px; overflow-y: auto; border: 1px solid #d1d5db;">${error.stack}</pre>
            </div>
        `;
    }
}

// Handle page load complete
window.addEventListener('load', () => {
    console.log('[Main] Page fully loaded');
    
    // Remove loading class if any
    document.body.classList.remove('loading');
    
    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('appReady'));
});
