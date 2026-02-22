/**
 * Language Manager
 * Handles bilingual EN/VI language switching
 * @module managers/LanguageManager
 */

import APP_CONFIG from '../config/app.config.js';
import appState from '../state/AppState.js';

class LanguageManager {
    constructor() {
        this.currentLang = appState.get('currentLanguage') || APP_CONFIG.language.default;
        this.elements = [];
    }

    /**
     * Initialize language manager
     */
    init() {
        console.log('[LanguageManager] Initializing...');
        
        // Get all translatable elements
        this.cacheElements();
        
        // Set up language switcher
        this.setupLanguageSwitcher();
        
        // Apply initial language
        this.switchLanguage(this.currentLang, false);
        
        console.log('[LanguageManager] Initialized with language:', this.currentLang);
    }

    /**
     * Cache all translatable elements
     */
    cacheElements() {
        // Get all elements with data-en or data-vi attributes
        this.elements = Array.from(document.querySelectorAll('[data-en], [data-vi]'));
        
        // Get placeholder elements
        this.placeholderElements = Array.from(
            document.querySelectorAll('[data-en-placeholder], [data-vi-placeholder]')
        );
        
        console.log(`[LanguageManager] Cached ${this.elements.length} translatable elements`);
     }

    /**
     * Setup language switcher button
     */
    setupLanguageSwitcher() {
        const langSwitch = document.getElementById('langSwitch');
        const currentLangDisplay = document.getElementById('currentLang');
        
        if (!langSwitch) {
            console.warn('[LanguageManager] Language switcher button not found');
            return;
        }

        langSwitch.addEventListener('click', () => {
            const newLang = this.currentLang === 'en' ? 'vi' : 'en';
            this.switchLanguage(newLang);
        });
    }

    /**
     * Switch language
     * @param {string} lang - Language code ('en' or 'vi')
     * @param {boolean} animate - Whether to animate the transition
     */
    switchLanguage(lang, animate = true) {
        if (!APP_CONFIG.language.supported.includes(lang)) {
            console.warn(`[LanguageManager] Unsupported language: ${lang}`);
            return;
        }

        console.log(`[LanguageManager] Switching to: ${lang}`);

        this.currentLang = lang;

        // Update state
        appState.set('currentLanguage', lang);

        // Update current language display
        const currentLangDisplay = document.getElementById('currentLang');
        if (currentLangDisplay) {
            currentLangDisplay.textContent = lang.toUpperCase();
        }

        // Update document lang attribute
        document.documentElement.lang = lang;

        // Update all translatable elements
        this.updateElements(animate);
    }

    /**
     * Update all translatable elements
     * @param {boolean} animate - Whether to animate
     */
    updateElements(animate = true) {
        // Update text content
        this.elements.forEach(element => {
            const text = element.getAttribute(`data-${this.currentLang}`);
            
            if (text) {
                if (animate) {
                    this.animateTextChange(element, text);
                } else {
                    element.textContent = text;
                }
            }
        });

        // Update placeholders
        this.placeholderElements.forEach(element => {
            const placeholder = element.getAttribute(`data-${this.currentLang}-placeholder`);
            
            if (placeholder) {
                element.placeholder = placeholder;
            }
        });

        // Update select options
        this.updateSelectOptions();

        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLang }
        }));
    }

    /**
     * Animate text change
     * @param {HTMLElement} element - Element to animate
     * @param {string} newText - New text content
     */
    animateTextChange(element, newText) {
        element.style.transition = 'opacity 0.2s';
        element.style.opacity = '0';

        setTimeout(() => {
            element.textContent = newText;
            element.style.opacity = '1';
        }, 200);
    }

    /**
     * Update select dropdown options
     */
    updateSelectOptions() {
        const productSelect = document.getElementById('product');
        
        if (!productSelect) return;

        const options = productSelect.querySelectorAll('option');
        
        options.forEach(option => {
            const text = option.getAttribute(`data-${this.currentLang}`);
            if (text) {
                option.textContent = text;
            }
        });
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * Get translation for a key
     * @param {string} key - Translation key
     * @param {object} translations - Translations object
     * @returns {string} Translated text
     */
    translate(key, translations) {
        return translations[this.currentLang]?.[key] || translations[APP_CONFIG.language.fallback]?.[key] || key;
    }
}

export default LanguageManager;
