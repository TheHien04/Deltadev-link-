/**
 * Wishlist Manager
 * Handles product wishlist (favorites) functionality
 * @module managers/WishlistManager
 */

export class WishlistManager {
    constructor(appState, config) {
        this.appState = appState;
        this.config = config;
        this.wishlist = [];
        this.panel = null;
        this.button = null;
    }

    /**
     * Initialize wishlist manager
     */
    init() {
        console.log('[WishlistManager] Initializing...');
        
        this.loadWishlist();
        this.createWishlistUI();
        this.attachEventListeners();
        this.updateWishlistCount();
        
        console.log('[WishlistManager] Initialized with', this.wishlist.length, 'items');
    }

    /**
     * Load wishlist from localStorage
     */
    loadWishlist() {
        try {
            const saved = localStorage.getItem('wishlist');
            this.wishlist = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('[WishlistManager] Failed to load wishlist:', error);
            this.wishlist = [];
        }
    }

    /**
     * Save wishlist to localStorage
     */
    saveWishlist() {
        try {
            localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
        } catch (error) {
            console.error('[WishlistManager] Failed to save wishlist:', error);
        }
    }

    /**
     * Create wishlist UI (button + panel)
     */
    createWishlistUI() {
        // Create wishlist button in navbar
        const nav = document.querySelector('nav .container');
        if (nav) {
            const wishlistBtn = document.createElement('button');
            wishlistBtn.id = 'wishlistButton';
            wishlistBtn.className = 'relative p-2 hover:text-primary transition';
            wishlistBtn.innerHTML = `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                <span id="wishlistCount" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hidden">0</span>
            `;
            
            // Insert before cart button
            const cartBtn = document.querySelector('[data-cart-button]');
            if (cartBtn) {
                cartBtn.parentNode.insertBefore(wishlistBtn, cartBtn);
            } else {
                nav.appendChild(wishlistBtn);
            }
            this.button = wishlistBtn;
        }

        // Create wishlist panel
        const panel = document.createElement('div');
        panel.id = 'wishlistPanel';
        panel.className = 'fixed top-0 right-0 h-full w-full md:w-[400px] bg-white shadow-2xl transform translate-x-full transition-transform duration-300 z-[90]';
        panel.innerHTML = `
            <div class="flex flex-col h-full">
                <!-- Header -->
                <div class="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 class="text-2xl font-bold flex items-center gap-2">
                        <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                        </svg>
                        <span data-en="Wishlist" data-vi="Yêu thích">Yêu thích</span>
                        <span id="wishlistPanelCount" class="text-gray-400 text-lg">(0)</span>
                    </h2>
                    <button id="closeWishlistPanel" class="p-2 hover:bg-gray-100 rounded-lg transition">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                
                <!-- Wishlist Items -->
                <div id="wishlistItems" class="flex-1 overflow-y-auto p-6">
                    <!-- Items will be injected here -->
                </div>
                
                <!-- Empty State -->
                <div id="wishlistEmpty" class="flex-1 flex flex-col items-center justify-center p-6 text-center hidden">
                    <svg class="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    <h3 class="text-xl font-semibold mb-2" data-en="No favorites yet" data-vi="Chưa có sản phẩm yêu thích">Chưa có sản phẩm yêu thích</h3>
                    <p class="text-gray-500" data-en="Add products you love!" data-vi="Thêm sản phẩm bạn yêu thích!">Thêm sản phẩm bạn yêu thích!</p>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        this.panel = panel;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Open wishlist panel
        this.button?.addEventListener('click', () => this.openPanel());
        
        // Close wishlist panel
        document.getElementById('closeWishlistPanel')?.addEventListener('click', () => this.closePanel());
        
        // Close on outside click
        this.panel?.addEventListener('click', (e) => {
            if (e.target === this.panel) this.closePanel();
        });
        
        // Listen for wishlist updates from other managers
        document.addEventListener('wishlistUpdated', () => {
            this.loadWishlist();
            this.updateWishlistCount();
            this.renderWishlist();
        });
        
        // Add heart icons to product cards
        this.addWishlistButtonsToProducts();
    }

    /**
     * Add wishlist buttons to product cards
     */
    addWishlistButtonsToProducts() {
        const productCards = document.querySelectorAll('.product-card:not(.coming-soon)');
        
        productCards.forEach(card => {
            const button = card.querySelector('.add-to-cart');
            if (!button) return;
            
            const productId = button.dataset.productId;
            
            // Check if heart button already exists
            if (card.querySelector('.wishlist-heart')) return;
            
            // Create heart button
            const heartBtn = document.createElement('button');
            heartBtn.className = 'wishlist-heart absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition z-10';
            heartBtn.dataset.productId = productId;
            
            const isInWishlist = this.wishlist.some(p => p.id === productId);
            
            heartBtn.innerHTML = `
                <svg class="w-6 h-6 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-400'}" fill="${isInWishlist ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
            `;
            
            heartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleWishlist({
                    id: button.dataset.productId,
                    name: button.dataset.productName,
                    price: parseInt(button.dataset.productPrice),
                    image: button.dataset.productImage
                });
            });
            
            // Add to product card (find the relative parent)
            const imageContainer = card.querySelector('.product-image') || card.querySelector('.relative');
            if (imageContainer) {
                imageContainer.style.position = 'relative';
                imageContainer.appendChild(heartBtn);
            }
        });
    }

    /**
     * Toggle product in wishlist
     */
    toggleWishlist(product) {
        const exists = this.wishlist.find(p => p.id === product.id);
        
        if (exists) {
            this.wishlist = this.wishlist.filter(p => p.id !== product.id);
            this.showNotification('info', 'Đã xóa khỏi yêu thích');
        } else {
            this.wishlist.push(product);
            this.showNotification('success', '❤️ Đã thêm vào yêu thích!');
        }
        
        this.saveWishlist();
        this.updateWishlistCount();
        this.renderWishlist();
        this.updateHeartIcons();
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('wishlistUpdated'));
    }

    /**
     * Update heart icons on product cards
     */
    updateHeartIcons() {
        document.querySelectorAll('.wishlist-heart').forEach(btn => {
            const productId = btn.dataset.productId;
            const isInWishlist = this.wishlist.some(p => p.id === productId);
            const svg = btn.querySelector('svg');
            
            if (isInWishlist) {
                svg.classList.add('text-red-500', 'fill-current');
                svg.classList.remove('text-gray-400');
                svg.setAttribute('fill', 'currentColor');
            } else {
                svg.classList.remove('text-red-500', 'fill-current');
                svg.classList.add('text-gray-400');
                svg.setAttribute('fill', 'none');
            }
        });
    }

    /**
     * Update wishlist count badge
     */
    updateWishlistCount() {
        const count = this.wishlist.length;
        const countBadge = document.getElementById('wishlistCount');
        const panelCount = document.getElementById('wishlistPanelCount');
        
        if (countBadge) {
            countBadge.textContent = count;
            countBadge.classList.toggle('hidden', count === 0);
        }
        
        if (panelCount) {
            panelCount.textContent = `(${count})`;
        }
    }

    /**
     * Render wishlist items
     */
    renderWishlist() {
        const container = document.getElementById('wishlistItems');
        const emptyState = document.getElementById('wishlistEmpty');
        
        if (!container || !emptyState) return;
        
        if (this.wishlist.length === 0) {
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }
        
        container.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        container.innerHTML = this.wishlist.map(product => `
            <div class="flex gap-4 p-4 bg-gray-50 rounded-xl mb-3 group hover:bg-gray-100 transition">
                <img src="${product.image}" alt="${product.name}" class="w-20 h-20 object-cover rounded-lg">
                <div class="flex-1">
                    <h3 class="font-semibold text-sm mb-1">${product.name}</h3>
                    <p class="text-primary font-bold">${this.formatPrice(product.price)}</p>
                </div>
                <div class="flex flex-col gap-2">
                    <button class="add-to-cart-from-wishlist p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition" data-product='${JSON.stringify(product)}' title="Add to cart">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                    </button>
                    <button class="remove-from-wishlist p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-red-100 hover:text-red-600 transition" data-product-id="${product.id}" title="Remove">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Attach item event listeners
        container.querySelectorAll('.remove-from-wishlist').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.dataset.productId;
                this.removeFromWishlist(productId);
            });
        });
        
        container.querySelectorAll('.add-to-cart-from-wishlist').forEach(btn => {
            btn.addEventListener('click', () => {
                const product = JSON.parse(btn.dataset.product);
                document.dispatchEvent(new CustomEvent('addToCart', {
                    detail: { ...product, quantity: 1 }
                }));
                this.showNotification('success', 'Đã thêm vào giỏ hàng!');
            });
        });
    }

    /**
     * Remove product from wishlist
     */
    removeFromWishlist(productId) {
        this.wishlist = this.wishlist.filter(p => p.id !== productId);
        this.saveWishlist();
        this.updateWishlistCount();
        this.renderWishlist();
        this.updateHeartIcons();
        document.dispatchEvent(new CustomEvent('wishlistUpdated'));
    }

    /**
     * Open wishlist panel
     */
    openPanel() {
        this.renderWishlist();
        this.panel?.classList.remove('translate-x-full');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close wishlist panel
     */
    closePanel() {
        this.panel?.classList.add('translate-x-full');
        document.body.style.overflow = '';
    }

    /**
     * Format price
     */
    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }

    /**
     * Show notification
     */
    showNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `fixed top-24 right-8 px-6 py-3 rounded-lg shadow-lg z-[110] transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('opacity-0', 'translate-x-8');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

export default WishlistManager;
