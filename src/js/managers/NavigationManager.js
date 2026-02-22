/**
 * Navigation Manager
 * Handles navigation, mobile menu, smooth scrolling, and scroll effects
 * @module managers/NavigationManager
 */

import appState from '../state/AppState.js';

class NavigationManager {
    constructor() {
        this.navbar = null;
        this.mobileMenuToggle = null;
        this.mobileMenu = null;
        this.navLinks = [];
        this.mobileNavLinks = [];
        this.backToTopBtn = null;
        this.isMenuOpen = false;
        this.lastScrollTop = 0;
    }

    /**
     * Initialize navigation manager
     */
    init() {
        console.log('[NavigationManager] Initializing...');
        
        this.cacheElements();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupScrollEffects();
        this.setupBackToTop();
        this.setupActiveSection();
        
        console.log('[NavigationManager] Initialized');
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.navbar = document.getElementById('navbar');
        this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.mobileMenu = document.getElementById('mobileMenu');
        this.navLinks = Array.from(document.querySelectorAll('.nav-link'));
        this.mobileNavLinks = Array.from(document.querySelectorAll('.mobile-nav-link'));
        this.backToTopBtn = document.getElementById('backToTop');
    }

    /**
     * Setup mobile menu toggle
     */
    setupMobileMenu() {
        if (!this.mobileMenuToggle || !this.mobileMenu) {
            console.warn('[NavigationManager] Mobile menu elements not found');
            return;
        }

        // Toggle menu on button click
        this.mobileMenuToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close menu on link click
        this.mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && 
                !this.mobileMenu.contains(e.target) && 
                !this.mobileMenuToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        
        this.mobileMenu.classList.toggle('active');
        this.mobileMenuToggle.classList.toggle('active');
        this.mobileMenuToggle.setAttribute('aria-expanded', this.isMenuOpen);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
        
        // Update state
        appState.set('isMenuOpen', this.isMenuOpen);
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        if (!this.isMenuOpen) return;
        
        this.isMenuOpen = false;
        this.mobileMenu.classList.remove('active');
        this.mobileMenuToggle.classList.remove('active');
        this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        
        appState.set('isMenuOpen', false);
    }

    /**
     * Setup smooth scrolling for anchor links
     */
    setupSmoothScrolling() {
        const allLinks = [...this.navLinks, ...this.mobileNavLinks];
        
        allLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        this.scrollToElement(targetElement);
                    }
                }
            });
        });
    }

    /**
     * Scroll to element smoothly
     * @param {HTMLElement} element - Target element
     */
    scrollToElement(element) {
        const navbarHeight = this.navbar?.offsetHeight || 80;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navbarHeight;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Setup scroll effects (navbar background, hide/show)
     */
    setupScrollEffects() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Update state
        appState.set('scrollPosition', scrollTop);

        // Add/remove scrolled class to navbar
        if (this.navbar) {
            if (scrollTop > 50) {
                this.navbar.classList.add('scrolled');
                appState.set('isScrolled', true);
            } else {
                this.navbar.classList.remove('scrolled');
                appState.set('isScrolled', false);
            }
        }

        // Show/hide back to top button
        if (this.backToTopBtn) {
            if (scrollTop > 300) {
                this.backToTopBtn.classList.add('visible');
            } else {
                this.backToTopBtn.classList.remove('visible');
            }
        }

        this.lastScrollTop = scrollTop;
    }

    /**
     * Setup back to top button
     */
    setupBackToTop() {
        if (!this.backToTopBtn) {
            console.warn('[NavigationManager] Back to top button not found');
            return;
        }

        this.backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /**
     * Setup active section highlighting
     */
    setupActiveSection() {
        const sections = Array.from(document.querySelectorAll('section[id]'));
        
        if (sections.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.setActiveLink(sectionId);
                    appState.set('currentSection', sectionId);
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    /**
     * Set active navigation link
     * @param {string} sectionId - Active section ID
     */
    setActiveLink(sectionId) {
        // Desktop links
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Mobile links
        this.mobileNavLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

export default NavigationManager;
