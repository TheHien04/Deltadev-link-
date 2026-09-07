/**
 * Image Loader Utility
 * Lazy loading images with Intersection Observer and graceful fallbacks
 * @module utils/ImageLoader
 */

import logger from './logger.js';

const FALLBACK_SRC = '/src/assets/images/product-classic.svg';

class ImageLoader {
    constructor() {
        this.images = [];
        this.observer = null;
        this.loaded = 0;
        this.total = 0;
    }

    /**
     * Initialize image loader
     */
    init() {
        logger.info('[ImageLoader]', 'Initializing...');
        
        this.cacheImages();
        this.setupIntersectionObserver();
        this.observeImages();
        this.bindBrokenImageFallbacks();
        
        logger.info('[ImageLoader]', `Initialized with ${this.total} images`);
    }

    /**
     * Cache all lazy-loadable images
     */
    cacheImages() {
        // Find all images with loading="lazy"
        this.images = Array.from(document.querySelectorAll('img[loading="lazy"]'));
        this.total = this.images.length;
    }

    /**
     * Setup Intersection Observer
     */
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px 0px', // Start loading 50px before viewport
            threshold: 0.01
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                }
            });
        }, options);
    }

    /**
     * Observe all images
     */
    observeImages() {
        this.images.forEach(img => {
            this.observer.observe(img);
        });
    }

    /**
     * Load a single image
     * @param {HTMLImageElement} img - Image element
     */
    loadImage(img) {
        const src = img.getAttribute('src');
        
        if (!src || img.classList.contains('loaded')) {
            return;
        }

        // Add loading class
        img.classList.add('loading');

        // Load image
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
            this.loaded++;
            
            // Unobserve after loading
            this.observer.unobserve(img);
            
            // Trigger custom event
            img.dispatchEvent(new CustomEvent('imageLoaded', {
                detail: { src, loaded: this.loaded, total: this.total }
            }));
            
            logger.debug('[ImageLoader]', `Loaded ${this.loaded}/${this.total}`);
        };

        imageLoader.onerror = () => {
            img.classList.remove('loading');
            img.classList.add('error');
            this.applyFallback(img);
            logger.warn('[ImageLoader]', 'Failed to load:', src);
        };

        imageLoader.src = src;
    }

    applyFallback(img) {
        if (!img || img.dataset.fallbackApplied === 'true') return;
        img.dataset.fallbackApplied = 'true';
        img.src = FALLBACK_SRC;
        img.classList.add('img-fallback');
    }

    bindBrokenImageFallbacks() {
        document.querySelectorAll('img').forEach((img) => {
            img.addEventListener('error', () => this.applyFallback(img), { once: true });
            if (img.complete && img.naturalWidth === 0 && img.src) {
                this.applyFallback(img);
            }
        });
    }

    /**
     * Preload critical images
     * @param {string[]} urls - Image URLs to preload
     */
    preload(urls) {
        return Promise.all(
            urls.map(url => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(url);
                    img.onerror = () => reject(url);
                    img.src = url;
                });
            })
        );
    }

    /**
     * Get loading progress
     * @returns {object} Progress info
     */
    getProgress() {
        return {
            loaded: this.loaded,
            total: this.total,
            percentage: this.total > 0 ? (this.loaded / this.total) * 100 : 0
        };
    }

    /**
     * Disconnect observer
     */
    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

export default ImageLoader;
