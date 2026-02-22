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

class App {
    constructor() {
        this.managers = {};
        this.initialized = false;
    }

    /**
     * Initialize application
     */
    async init() {
        console.log(`%c🍖 ${APP_CONFIG.app.name} - v${APP_CONFIG.app.version}`, 'color: #C41E3A; font-size: 20px; font-weight: bold;');
        console.log(`%cStarting...`, 'color: #666;');
        
        try {
            // Show loading state
            appState.set('isLoading', true);
            
            // Wait for DOM to be ready
            await this.waitForDOM();
            
            // Initialize managers
            await this.initializeManagers();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Register service worker (PWA)
            if (APP_CONFIG.features.enableServiceWorker) {
                this.registerServiceWorker();
            }
            
            // Hide loading state
            appState.set('isLoading', false);
            
            this.initialized = true;
            
            console.log(`%c✅ Initialization Complete!`, 'color: #27AE60; font-weight: bold;');
            
            // Log performance metrics
            this.logPerformanceMetrics();
            
        } catch (error) {
            console.error('[App] Initialization failed:', error);
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
        console.log('[App] Initializing managers...');
        
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
        
        console.log('[App] All managers initialized');
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('[App] Page hidden');
            } else {
                console.log('[App] Page visible');
                // Refresh animations if needed
                if (this.managers.animation) {
                    this.managers.animation.refreshAOS();
                }
            }
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            console.log('[App] Back online');
            this.showNotification('You are back online', 'success');
        });

        window.addEventListener('offline', () => {
            console.log('[App] Offline');
            this.showNotification('You are offline', 'warning');
        });

        // Handle errors globally
        window.addEventListener('error', (event) => {
            console.error('[App] Global error:', event.error);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('[App] Unhandled promise rejection:', event.reason);
        });

        // Handle language changes
        document.addEventListener('languageChanged', (event) => {
            console.log('[App] Language changed to:', event.detail.language);
        });

        // Handle before unload (save state)
        window.addEventListener('beforeunload', () => {
            appState.persist();
        });
    }

    /**
     * Register service worker for PWA
     */
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('[App] Service workers not supported');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register('/public/service-worker.js');
            console.log('[App] Service Worker registered:', registration.scope);
            
            // Handle updates
            registration.addEventListener('updatefound', () => {
                console.log('[App] Service Worker update found');
                const newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('[App] New version available');
                        this.showNotification('New version available! Refresh to update.', 'info');
                    }
                });
            });
        } catch (error) {
            console.error('[App] Service Worker registration failed:', error);
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
        if (!performance || !performance.timing) return;

        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
        const firstPaint = performance.getEntriesByType('paint')?.[0]?.startTime || 0;

        console.log('%cPerformance Metrics:', 'color: #3498DB; font-weight: bold;');
        console.log(`  Page Load Time: ${loadTime}ms`);
        console.log(`  DOM Ready: ${domReady}ms`);
        console.log(`  First Paint: ${firstPaint.toFixed(2)}ms`);

        // Check Core Web Vitals if available
        if (window.PerformanceObserver) {
            try {
                // Largest Contentful Paint (LCP)
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log(`  LCP: ${lastEntry.renderTime || lastEntry.loadTime}ms`);
                }).observe({ entryTypes: ['largest-contentful-paint'] });

                // First Input Delay (FID)
                new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        console.log(`  FID: ${entry.processingStart - entry.startTime}ms`);
                    });
                }).observe({ entryTypes: ['first-input'] });

                // Cumulative Layout Shift (CLS)
                let clsScore = 0;
                new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsScore += entry.value;
                        }
                    });
                    console.log(`  CLS: ${clsScore.toFixed(3)}`);
                }).observe({ entryTypes: ['layout-shift'] });
            } catch (error) {
                console.warn('[App] Could not observe performance metrics:', error);
            }
        }
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
