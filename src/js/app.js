/**
 * Main Application Controller
 * Orchestrates all managers and initializes the app
 * @module app
 */

import APP_CONFIG from './config/app.config.js';
import appState from './state/AppState.js';
import LanguageManager from './managers/LanguageManager.js';
import NavigationManager from './managers/NavigationManager.js';
import FormHandler from './managers/FormHandler.js';
import AnimationManager from './managers/AnimationManager.js';
import ImageLoader from './utils/ImageLoader.js';
import ShoppingCartManager from './managers/ShoppingCartManager.js';
import LiveChatWidget from './managers/LiveChatWidget.js';
import ProductSearchManager from './managers/ProductSearchManager.js';
import ProductDetailsManager from './managers/ProductDetailsManager.js';
import WishlistManager from './managers/WishlistManager.js';
import ComparisonManager from './managers/ComparisonManager.js';
import ReviewManager from './managers/ReviewManager.js';
import OrderTrackingManager from './managers/OrderTrackingManager.js';
import UserAccountManager from './managers/UserAccountManager.js';
import StockManager from './managers/StockManager.js';
import LoyaltyProgramManager from './managers/LoyaltyProgramManager.js';
import NewsletterManager from './managers/NewsletterManager.js';
import { initAnalytics } from './services/Analytics.js';
import { ENV } from './config/env.config.js';
import logger from './utils/logger.js';

class App {
    constructor() {
        this.managers = {};
        this.initialized = false;
    }

    /**
     * Initialize application
     */
    async init() {
        logger.info('[App]', `${APP_CONFIG.app.name} - v${APP_CONFIG.app.version}`);
        
        try {
            appState.set('isLoading', true);
            
            await this.waitForDOM();
            await this.initializeManagers();
            this.setupEventListeners();
            initAnalytics(APP_CONFIG.analytics);
            
            if (APP_CONFIG.features.enableServiceWorker && ENV.features.enableServiceWorker) {
                this.registerServiceWorker();
            }
            
            appState.set('isLoading', false);
            this.initialized = true;
            
            logger.info('[App]', 'Initialization complete');
            this.logPerformanceMetrics();
            
        } catch (error) {
            logger.error('[App]', 'Initialization failed:', error);
            appState.set('isLoading', false);
        }
    }

    /**
     * Wait for DOM to be ready
     */
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * Initialize all managers
     */
    async initializeManagers() {
        logger.info('[App]', 'Initializing managers...');
        
        // Language Manager
        this.managers.language = new LanguageManager();
        this.managers.language.init();
        
        // Navigation Manager
        this.managers.navigation = new NavigationManager();
        this.managers.navigation.init();
        
        // User Account Manager
        this.managers.userAccount = new UserAccountManager(appState, APP_CONFIG);
        this.managers.userAccount.init();
        
        // Form Handler
        this.managers.form = new FormHandler();
        this.managers.form.init();
        
        // Image Loader
        this.managers.imageLoader = new ImageLoader();
        this.managers.imageLoader.init();
        
        // Shopping Cart Manager
        if (APP_CONFIG.features.enableShoppingCart) {
            this.managers.cart = new ShoppingCartManager(appState, APP_CONFIG);
            this.managers.cart.init();
        }
        
        // Live Chat Widget
        if (APP_CONFIG.features.enableChatWidget) {
            this.managers.liveChat = new LiveChatWidget(appState, APP_CONFIG);
            this.managers.liveChat.init();
        }
        
        // Product Search & Filter Manager
        this.managers.productSearch = new ProductSearchManager(appState, APP_CONFIG);
        this.managers.productSearch.init();
        
        // Product Details Manager (modal, quick view, related products)
        this.managers.productDetails = new ProductDetailsManager(appState, APP_CONFIG);
        this.managers.productDetails.init();
        
        // Wishlist Manager (favorite products)
        this.managers.wishlist = new WishlistManager(appState, APP_CONFIG);
        this.managers.wishlist.init();
        
        // Comparison Manager (compare up to 3 products)
        this.managers.comparison = new ComparisonManager(appState, APP_CONFIG);
        this.managers.comparison.init();
        
        // Review Manager (product reviews and ratings)
        this.managers.review = new ReviewManager(appState, APP_CONFIG);
        this.managers.review.init();
        
        // Order Tracking Manager (track orders and history)
        this.managers.orderTracking = new OrderTrackingManager(appState, APP_CONFIG);
        this.managers.orderTracking.init();
        
        // Stock Manager (inventory & social proof)
        this.managers.stock = new StockManager(appState, APP_CONFIG);
        this.managers.stock.init();
        
        // Loyalty Program Manager (points & rewards)
        this.managers.loyalty = new LoyaltyProgramManager(appState, APP_CONFIG);
        this.managers.loyalty.init();
        
        // Newsletter Manager (email subscriptions)
        this.managers.newsletter = new NewsletterManager(appState, APP_CONFIG);
        this.managers.newsletter.init();
        
        // Animation Manager (wait for external libraries)
        this.managers.animation = new AnimationManager();
        await this.managers.animation.init();
        
        logger.info('[App]', 'All managers initialized');
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.managers.animation) {
                this.managers.animation.refreshAOS();
            }
        });

        window.addEventListener('online', () => {
            this.showNotification('You are back online', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('You are offline. Some features may be unavailable.', 'warning');
        });

        window.addEventListener('error', (event) => {
            logger.error('[App]', 'Global error:', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            logger.error('[App]', 'Unhandled promise rejection:', event.reason);
        });

        window.addEventListener('beforeunload', () => {
            appState.persist();
        });
    }

    /**
     * Register service worker for PWA
     */
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register('/public/service-worker.js', { scope: '/' });
            logger.info('[App]', 'Service Worker registered:', registration.scope);
            
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker?.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showNotification('A new version is available. Refresh to update.', 'info');
                    }
                });
            });
        } catch (error) {
            logger.warn('[App]', 'Service Worker registration failed:', error);
        }
    }

    /**
     * Show notification toast
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, warning, error, info)
     */
    showNotification(message, type = 'info') {
        const bgColors = {
            success: 'var(--color-success)',
            warning: 'var(--color-warning)',
            error: 'var(--color-danger)',
            info: 'var(--color-info)'
        };

        const toast = document.createElement('div');
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: ${bgColors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            max-width: 400px;
            animation: slideInUp 0.3s ease-out;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    /**
     * Log performance metrics
     */
    logPerformanceMetrics() {
        if (!logger.enabled || typeof performance === 'undefined') return;

        const nav = performance.getEntriesByType?.('navigation')?.[0];
        const paint = performance.getEntriesByType?.('paint') || [];
        const firstPaint = paint.find((entry) => entry.name === 'first-contentful-paint')?.startTime;

        logger.info('[Perf]', {
            domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
            loadEvent: nav ? Math.round(nav.loadEventEnd) : null,
            firstContentfulPaint: firstPaint ? Math.round(firstPaint) : null
        });
    }

    /**
     * Get manager instance
     * @param {string} name - Manager name
     * @returns {object} Manager instance
     */
    getManager(name) {
        return this.managers[name];
    }

    /**
     * Check if app is initialized
     * @returns {boolean} Is initialized
     */
    isInitialized() {
        return this.initialized;
    }
}

// Create and export singleton instance
const app = new App();

export default app;
