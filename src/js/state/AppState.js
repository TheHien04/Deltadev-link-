/**
 * Application State Manager
 * Reactive state management with observer pattern
 * @module state/AppState
 */

import logger from '../utils/logger.js';

class AppState {
    constructor() {
        this._state = {
            currentLanguage: 'en',
            isMenuOpen: false,
            isLoading: false,
            scrollPosition: 0,
            isScrolled: false,
            currentSection: 'home',
            formData: {},
            orderTotal: 0,
            cart: [],
            currentUser: null
        };

        this._observers = {};
    }

    get(key) {
        return this._state[key];
    }

    set(key, value) {
        const oldValue = this._state[key];
        if (oldValue === value) return;

        this._state[key] = value;
        this._notifyObservers(key, value, oldValue);
        logger.debug('[State]', `${key}:`, oldValue, '->', value);
    }

    getAll() {
        return { ...this._state };
    }

    /**
     * Update multiple keys. Also exposed as setState() for manager compatibility.
     * @param {object} updates
     */
    update(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.set(key, value);
        });
    }

    setState(updates) {
        this.update(updates);
    }

    subscribe(key, callback) {
        if (!this._observers[key]) {
            this._observers[key] = [];
        }

        this._observers[key].push(callback);

        return () => {
            this._observers[key] = this._observers[key].filter((cb) => cb !== callback);
        };
    }

    _notifyObservers(key, newValue, oldValue) {
        if (this._observers[key]) {
            this._observers[key].forEach((callback) => {
                callback(newValue, oldValue);
            });
        }
    }

    reset() {
        this._state = {
            currentLanguage: 'en',
            isMenuOpen: false,
            isLoading: false,
            scrollPosition: 0,
            isScrolled: false,
            currentSection: 'home',
            formData: {},
            orderTotal: 0,
            cart: [],
            currentUser: null
        };

        Object.keys(this._observers).forEach((key) => {
            this._notifyObservers(key, this._state[key], undefined);
        });
    }

    persist(keys = ['currentLanguage']) {
        try {
            const stateToPersist = {};
            keys.forEach((key) => {
                if (this._state[key] !== undefined) {
                    stateToPersist[key] = this._state[key];
                }
            });
            localStorage.setItem('appState', JSON.stringify(stateToPersist));
        } catch (error) {
            logger.error('[AppState]', 'Failed to persist state:', error);
        }
    }

    restore(keys = ['currentLanguage']) {
        try {
            const persistedState = localStorage.getItem('appState');
            if (!persistedState) return;

            const state = JSON.parse(persistedState);
            keys.forEach((key) => {
                if (state[key] !== undefined) {
                    this.set(key, state[key]);
                }
            });
        } catch (error) {
            logger.error('[AppState]', 'Failed to restore state:', error);
        }
    }
}

const appState = new AppState();
appState.restore();
appState.subscribe('currentLanguage', () => {
    appState.persist(['currentLanguage']);
});

export default appState;
