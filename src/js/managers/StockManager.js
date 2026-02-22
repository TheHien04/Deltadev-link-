/**
 * Stock & Social Proof Manager
 * Handles inventory display and social proof features
 * @module managers/StockManager
 */

export class StockManager {
    constructor(appState, config) {
        this.appState = appState;
        this.config = config;
        this.stockData = {};
        this.viewingData = {};
        this.currentLanguage = 'vi';
        
        // Initialize stock data
        this.initializeStock();
        
        // Initialize viewing counters
        this.initializeViewingCounters();
    }

    /**
     * Initialize stock data for all products
     */
    initializeStock() {
        // Generate random stock between 15-80
        const productIds = [
            'lap-xuong-classic',
            'lap-xuong-gift',
            'lap-xuong-premium',
            'lap-xuong-organic',
            'lap-xuong-spicy',
            'lap-xuong-family'
        ];

        productIds.forEach(id => {
            this.stockData[id] = Math.floor(Math.random() * (80 - 15 + 1)) + 15;
        });

        // Load from localStorage if available
        try {
            const stored = localStorage.getItem('productStock');
            if (stored) {
                this.stockData = { ...this.stockData, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error('[StockManager] Failed to load stock data:', error);
        }
    }

    /**
     * Initialize viewing counters
     */
    initializeViewingCounters() {
        // Generate random viewing count between 5-45
        Object.keys(this.stockData).forEach(id => {
            this.viewingData[id] = Math.floor(Math.random() * (45 - 5 + 1)) + 5;
        });

        // Simulate dynamic changes
        setInterval(() => {
            Object.keys(this.viewingData).forEach(id => {
                // Randomly increase or decrease by 1-3
                const change = Math.floor(Math.random() * 7) - 3; // -3 to +3
                this.viewingData[id] = Math.max(3, Math.min(50, this.viewingData[id] + change));
            });
            this.updateViewingDisplay();
        }, 15000); // Update every 15 seconds
    }

    /**
     * Initialize manager
     */
    init() {
        console.log('[StockManager] Initializing...');
        
        // Load language
        this.currentLanguage = this.appState.get('currentLanguage') || 'vi';
        
        // Listen for language changes
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            this.updateAllDisplays();
        });
        
        // Add stock info to all product cards
        this.addStockToAllProducts();
        
        // Add social proof to all product cards
        this.addSocialProofToAllProducts();
        
        console.log('[StockManager] Initialized');
    }

    /**
     * Add stock information to all product cards
     */
    addStockToAllProducts() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const button = card.querySelector('.add-to-cart');
            if (!button) return;
            
            const productId = button.dataset.productId;
            const stock = this.stockData[productId] || this.getRandomStock();
            
            // Add stock data attribute
            button.dataset.productStock = stock;
            
            // Check if stock info already exists
            if (card.querySelector('.stock-info')) return;
            
            // Find the price div
            const priceDiv = card.querySelector('.flex.items-center.justify-between');
            if (!priceDiv) return;
            
            // Create stock info element
            const stockInfo = document.createElement('div');
            stockInfo.className = 'stock-info flex items-center gap-2 mb-3 text-sm';
            
            const stockLevel = stock > 30 ? 'high' : stock > 15 ? 'medium' : 'low';
            const colorClass = stockLevel === 'high' ? 'text-green-600' : stockLevel === 'medium' ? 'text-yellow-600' : 'text-red-600';
            const iconColor = stockLevel === 'high' ? 'text-green-500' : stockLevel === 'medium' ? 'text-yellow-500' : 'text-red-500';
            
            stockInfo.innerHTML = `
                <svg class="w-4 h-4 ${iconColor}" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="${colorClass} font-semibold">
                    <span data-en="In Stock: ${stock} kg" data-vi="Còn hàng: ${stock} kg">Còn hàng: ${stock} kg</span>
                </span>
            `;
            
            // Insert after price div
            priceDiv.after(stockInfo);
        });
    }

    /**
     * Add social proof to all product cards
     */
    addSocialProofToAllProducts() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const button = card.querySelector('.add-to-cart');
            if (!button) return;
            
            const productId = button.dataset.productId;
            const viewing = this.viewingData[productId] || this.getRandomViewing();
            
           // Check if social proof already exists
            if (card.querySelector('.social-proof')) return;
            
            // Find the product image container
            const imageContainer = card.querySelector('.product-image');
            if (!imageContainer) return;
            
            // Create social proof badge
            const socialProof = document.createElement('div');
            socialProof.className = 'social-proof absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg flex items-center gap-2';
            socialProof.dataset.productId = productId;
            
            socialProof.innerHTML = `
                <div class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-primary animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                    </svg>
                    <span class="flame-icon text-orange-500">🔥</span>
                </div>
                <span class="text-sm font-semibold text-gray-800">
                    <span class="viewing-count">${viewing}</span>
                    <span data-en=" viewing" data-vi=" đang xem"> đang xem</span>
                </span>
            `;
            
            imageContainer.appendChild(socialProof);
        });
    }

    /**
     * Update viewing display
     */
    updateViewingDisplay() {
        document.querySelectorAll('.social-proof').forEach(badge => {
            const productId = badge.dataset.productId;
            const viewingCount = badge.querySelector('.viewing-count');
            if (viewingCount && this.viewingData[productId]) {
                viewingCount.textContent = this.viewingData[productId];
            }
        });
    }

    /**
     * Update language for all badges
     */
    updateLanguage() {
        // Update stock info text
        document.querySelectorAll('.stock-info').forEach(stockDiv => {
            const stockSpan = stockDiv.querySelector('span[data-en]');
            if (stockSpan) {
                const stockMatch = stockSpan.textContent.match(/\d+/);
                if (stockMatch) {
                    const stock = stockMatch[0];
                    if (this.currentLanguage === 'en') {
                        stockSpan.textContent = `In Stock: ${stock} kg`;
                    } else {
                        stockSpan.textContent = `Còn hàng: ${stock} kg`;
                    }
                }
            }
        });
        
        // Update social proof "viewing" text
        document.querySelectorAll('.social-proof').forEach(badge => {
            const textSpan = badge.querySelector('span[data-en]');
            if (textSpan) {
                if (this.currentLanguage === 'en') {
                    textSpan.textContent = ' viewing';
                } else {
                    textSpan.textContent = ' đang xem';
                }
            }
        });
    }

    /**
     * Update all displays (stock + social proof)
     */
    updateAllDisplays() {
        // Update stock info text based on current language
        document.querySelectorAll('.stock-info').forEach(stockDiv => {
            const stockSpan = stockDiv.querySelector('span[data-en]');
            if (stockSpan) {
                const stockMatch = stockSpan.textContent.match(/\d+/);
                if (stockMatch) {
                    const stock = stockMatch[0];
                    if (this.currentLanguage === 'en') {
                        stockSpan.textContent = `In Stock: ${stock} kg`;
                    } else {
                        stockSpan.textContent = `Còn hàng: ${stock} kg`;
                    }
                }
            }
        });
        
        // Update social proof "viewing" text based on current language
        document.querySelectorAll('.social-proof').forEach(badge => {
            const textSpan = badge.querySelector('span[data-en]');
            if (textSpan) {
                if (this.currentLanguage === 'en') {
                    textSpan.textContent = ' viewing';
                } else {
                    textSpan.textContent = ' đang xem';
                }
            }
        });
    }

    /**
     * Get random stock
     */
    getRandomStock() {
        return Math.floor(Math.random() * (80 - 15 + 1)) + 15;
    }

    /**
     * Get random viewing count
     */
    getRandomViewing() {
        return Math.floor(Math.random() * (45 - 5 + 1)) + 5;
    }

    /**
     * Reduce stock when product is purchased
     */
    reduceStock(productId, quantity) {
        if (this.stockData[productId]) {
            this.stockData[productId] = Math.max(0, this.stockData[productId] - quantity);
            this.saveStock();
            this.updateStockDisplay(productId);
        }
    }

    /**
     * Update stock display for specific product
     */
    updateStockDisplay(productId) {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            const button = card.querySelector('.add-to-cart');
            if (button && button.dataset.productId === productId) {
                const stockInfo = card.querySelector('.stock-info span');
                if (stockInfo && this.stockData[productId]) {
                    const stock = this.stockData[productId];
                    button.dataset.productStock = stock;
                    
                    if (this.currentLanguage === 'vi') {
                        stockInfo.innerHTML = `<span data-en="In Stock: ${stock} kg" data-vi="Còn hàng: ${stock} kg">Còn hàng: ${stock} kg</span>`;
                    } else {
                        stockInfo.innerHTML = `<span data-en="In Stock: ${stock} kg" data-vi="Còn hàng: ${stock} kg">In Stock: ${stock} kg</span>`;
                    }
                }
            }
        });
    }

    /**
     * Save stock data
     */
    saveStock() {
        try {
            localStorage.setItem('productStock', JSON.stringify(this.stockData));
        } catch (error) {
            console.error('[StockManager] Failed to save stock:', error);
        }
    }

    /**
     * Get stock for product
     */
    getStock(productId) {
        return this.stockData[productId] || 0;
    }

    /**
     * Check if product is in stock
     */
    isInStock(productId, quantity = 1) {
        return this.getStock(productId) >= quantity;
    }
}

export default StockManager;
