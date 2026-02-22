/**
 * Application State Manager
 * Reactive state management with observer pattern
 * @module state/AppState
 */

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
            orderTotal: 0
        };

        // Observers for state changes
        this._observers = {};
    }

    /**
     * Get current state
     * @param {string} key - State key
     * @returns {*} State value
     */
    get(key) {
        return this._state[key];
    }

    /**
     * Set state and notify observers
     * @param {string} key - State key
     * @param {*} value - New value
     */
    set(key, value) {
        const oldValue = this._state[key];
        
        if (oldValue === value) return;

        this._state[key] = value;

        // Notify observers
        this._notifyObservers(key, value, oldValue);

        // Log state changes for debugging
        console.log(`[State Change] ${key}:`, oldValue, '->', value);
    }

    /**
     * Get entire state object (read-only)
     * @returns {object} State object
     */
    getAll() {
        return { ...this._state };
    }

    /**
     * Update multiple state values at once
     * @param {object} updates - Object with key-value pairs
     */
    update(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.set(key, value);
        });
    }

    /**
     * Subscribe to state changes
     * @param {string} key - State key to observe
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(key, callback) {
        if (!this._observers[key]) {
            this._observers[key] = [];
        }

        this._observers[key].push(callback);

        // Return unsubscribe function
        return () => {
            this._observers[key] = this._observers[key].filter(cb => cb !== callback);
        };
    }

    /**
     * Notify all observers of a state change
     * @private
     */
    _notifyObservers(key, newValue, oldValue) {
        if (this._observers[key]) {
            this._observers[key].forEach(callback => {
                callback(newValue, oldValue);
            });
        }
    }

    /**
     * Reset state to initial values
     */
    reset() {
        this._state = {
            currentLanguage: 'en',
            isMenuOpen: false,
            isLoading: false,
            scrollPosition: 0,
            isScrolled: false,
            currentSection: 'home',
            formData: {},
            orderTotal: 0
        };

        // Notify all observers
        Object.keys(this._observers).forEach(key => {
            this._notifyObservers(key, this._state[key], undefined);
        });
    }

    /**
     * Persist state to localStorage
     * @param {string[]} keys - Keys to persist
     */
    persist(keys = ['currentLanguage']) {
        try {
            const stateToPersist = {};
            keys.forEach(key => {
                if (this._state[key] !== undefined) {
                    stateToPersist[key] = this._state[key];
                }
            });

            localStorage.setItem('appState', JSON.stringify(stateToPersist));
        } catch (error) {
            console.error('[AppState] Failed to persist state:', error);
        }
    }

    /**
     * Restore state from localStorage
     * @param {string[]} keys - Keys to restore
     */
    restore(keys = ['currentLanguage']) {
        try {
            const persistedState = localStorage.getItem('appState');
            
            if (persistedState) {
                const state = JSON.parse(persistedState);
                
                keys.forEach(key => {
                    if (state[key] !== undefined) {
                        this.set(key, state[key]);
                    }
                });
            }
        } catch (error) {
            console.error('[AppState] Failed to restore state:', error);
        }
    }
}

// Create and export singleton instance
const appState = new AppState();

// Restore persisted state on load
appState.restore();

// Persist state changes automatically
appState.subscribe('currentLanguage', () => {
    appState.persist(['currentLanguage']);
});

export default appState;
