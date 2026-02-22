/**
 * Animation Manager
 * Integrates AOS and GSAP animations
 * @module managers/AnimationManager
 */

import APP_CONFIG from '../config/app.config.js';

class AnimationManager {
    constructor() {
        this.aosInitialized = false;
        this.gsapInitialized = false;
    }

    /**
     * Initialize animation manager
     */
    async init() {
        console.log('[AnimationManager] Initializing...');
        
        // Wait for AOS and GSAP to load
        await this.waitForLibraries();
        
        // Initialize AOS
        this.initAOS();
        
        // Initialize GSAP animations
        this.initGSAP();
        
        console.log('[AnimationManager] Initialized');
    }

    /**
     * Wait for animation libraries to load
     */
    waitForLibraries() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.AOS && window.gsap) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 5000);
        });
    }

    /**
     * Initialize AOS (Animate On Scroll)
     */
    initAOS() {
        if (!window.AOS) {
            console.warn('[AnimationManager] AOS not loaded');
            return;
        }

        try {
            AOS.init({
                duration: APP_CONFIG.animation.aos.duration,
                offset: APP_CONFIG.animation.aos.offset,
                easing: APP_CONFIG.animation.aos.easing,
                once: APP_CONFIG.animation.aos.once,
                mirror: APP_CONFIG.animation.aos.mirror,
                anchorPlacement: 'top-bottom',
                disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            });

            this.aosInitialized = true;
            console.log('[AnimationManager] AOS initialized');

            // Refresh AOS on window resize
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    AOS.refresh();
                }, 200);
            });
        } catch (error) {
            console.error('[AnimationManager] AOS initialization failed:', error);
        }
    }

    /**
     * Initialize GSAP animations
     */
    initGSAP() {
        if (!window.gsap) {
            console.warn('[AnimationManager] GSAP not loaded');
            return;
        }

        try {
            const { gsap, ScrollTrigger } = window;
            
            // Register ScrollTrigger plugin
            if (ScrollTrigger) {
                gsap.registerPlugin(ScrollTrigger);
            }

            // Hero parallax effect
            this.setupHeroParallax(gsap, ScrollTrigger);
            
            // Scroll-triggered animations
            this.setupScrollAnimations(gsap, ScrollTrigger);
            
            // Floating elements
            this.setupFloatingElements(gsap);

            this.gsapInitialized = true;
            console.log('[AnimationManager] GSAP initialized');
        } catch (error) {
            console.error('[AnimationManager] GSAP initialization failed:', error);
        }
    }

    /**
     * Setup hero parallax effect
     */
    setupHeroParallax(gsap, ScrollTrigger) {
        const heroImage = document.querySelector('.hero-image');
        
        if (heroImage && ScrollTrigger) {
            gsap.to(heroImage, {
                y: 100,
                opacity: 0.8,
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        }
    }

    /**
     * Setup scroll-triggered animations
     */
    setupScrollAnimations(gsap, ScrollTrigger) {
        if (!ScrollTrigger) return;

        // Fade in sections
        const sections = document.querySelectorAll('.products, .about, .quality, .contact');
        
        sections.forEach(section => {
            gsap.from(section, {
                opacity: 0,
                y: 50,
                duration: 1,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'top 50%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
    }

    /**
     * Setup floating elements
     */
    setupFloatingElements(gsap) {
        const floatingElements = document.querySelectorAll('.animate-float');
        
        floatingElements.forEach(element => {
            gsap.to(element, {
                y: -20,
                duration: 3,
                ease: 'power1.inOut',
                yoyo: true,
                repeat: -1
            });
        });
    }

    /**
     * Refresh AOS animations
     */
    refreshAOS() {
        if (this.aosInitialized && window.AOS) {
            AOS.refresh();
        }
    }

    /**
     * Animate element with GSAP
     * @param {HTMLElement} element - Element to animate
     * @param {object} animation - Animation properties
     */
    animate(element, animation) {
        if (!this.gsapInitialized || !window.gsap) {
            console.warn('[AnimationManager] GSAP not initialized');
            return;
        }

        return gsap.to(element, {
            duration: APP_CONFIG.animation.gsap.duration,
            ease: APP_CONFIG.animation.gsap.ease,
            ...animation
        });
    }

    /**
     * Create stagger animation
     * @param {NodeList|Array} elements - Elements to animate
     * @param {object} animation - Animation properties
     * @param {number} stagger - Stagger delay
     */
    stagger(elements, animation, stagger = 0.1) {
        if (!this.gsapInitialized || !window.gsap) {
            console.warn('[AnimationManager] GSAP not initialized');
            return;
        }

        return gsap.from(elements, {
            duration: APP_CONFIG.animation.gsap.duration,
            ease: APP_CONFIG.animation.gsap.ease,
            stagger: stagger,
            ...animation
        });
    }

    /**
     * Kill all GSAP animations
     */
    killAll() {
        if (this.gsapInitialized && window.gsap) {
            gsap.killTweensOf('*');
        }
    }
}

export default AnimationManager;
