/**
 * Product Details Manager
 * Handles product detail modal, quick view, and related products
 * @module managers/ProductDetailsManager
 */

export class ProductDetailsManager {
    constructor(appState, config) {
        this.appState = appState;
        this.config = config;
        this.modal = null;
        this.currentProduct = null;
    }

    /**
     * Initialize product details manager
     */
    init() {
        console.log('[ProductDetailsManager] Initializing...');
        
        this.createModal();
        this.attachEventListeners();
        
        console.log('[ProductDetailsManager] Initialized successfully');
    }

    /**
     * Create product details modal
     */
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'productDetailsModal';
        modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm hidden z-[100] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
                <!-- Close Button -->
                <button id="closeProductModal" class="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition z-10">
                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>

                <!-- Product Details Content -->
                <div id="modalContent" class="p-6 md:p-8">
                    <!-- Content will be injected here -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.modal = modal;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Close modal
        document.getElementById('closeProductModal')?.addEventListener('click', () => this.closeModal());
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // Product card clicks - open details
        document.addEventListener('click', (e) => {
            // Check if clicked on add-to-cart button - let ShoppingCartManager handle it
            if (e.target.closest('.add-to-cart')) {
                return; // Don't open modal, let event bubble to ShoppingCartManager
            }
            
            const productCard = e.target.closest('.product-card');
            if (productCard && 
                !e.target.closest('.coming-soon') &&
                !e.target.closest('.social-proof') &&
                !e.target.closest('.stock-info') &&
                !e.target.closest('.wishlist-btn') &&
                !e.target.closest('.compare-btn')) {
                const button = productCard.querySelector('.add-to-cart');
                if (button) {
                    this.showProductDetails({
                        id: button.dataset.productId,
                        name: button.dataset.productName,
                        price: parseInt(button.dataset.productPrice),
                        image: button.dataset.productImage,
                        description: productCard.querySelector('.product-info p')?.textContent || '',
                        badge: productCard.querySelector('[class*="bg-"]')?.textContent?.trim() || ''
                    });
                }
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal?.classList.contains('hidden')) {
                this.closeModal();
            }
        });
    }

    /**
     * Show product details modal
     */
    showProductDetails(product) {
        this.currentProduct = product;
        
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;

        modalContent.innerHTML = `
            <div class="grid md:grid-cols-2 gap-8">
                <!-- Product Images -->
                <div class="space-y-4">
                    <div class="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
                    </div>
                    <!-- Thumbnail gallery can be added here -->
                </div>

                <!-- Product Info -->
                <div class="space-y-6">
                    <!-- Badge -->
                    ${product.badge ? `<span class="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">${product.badge}</span>` : ''}
                    
                    <!-- Product Name -->
                    <h2 class="text-3xl md:text-4xl font-display font-bold text-gray-800">${product.name}</h2>
                    
                    <!-- Rating -->
                    <div class="flex items-center gap-3">
                        <div class="flex gap-1">
                            ${this.renderStars(4.8)}
                        </div>
                        <span class="text-gray-600">(127 reviews)</span>
                    </div>
                    
                    <!-- Price -->
                    <div class="py-4 border-y border-gray-200">
                        <div class="flex items-baseline gap-2">
                            <span class="text-4xl font-bold text-primary">${this.formatPrice(product.price)}</span>
                            <span class="text-gray-500">/kg</span>
                        </div>
                    </div>
                    
                    <!-- Description -->
                    <div>
                        <h3 class="text-lg font-semibold mb-2" data-en="Description" data-vi="Mô tả">Mô tả</h3>
                        <p class="text-gray-600 leading-relaxed">${product.description}</p>
                    </div>
                    
                    <!-- Features -->
                    <div class="space-y-3">
                        <h3 class="text-lg font-semibold" data-en="Features" data-vi="Đặc điểm">Đặc điểm</h3>
                        <ul class="space-y-2">
                            <li class="flex items-center gap-2 text-gray-600">
                                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                                </svg>
                                <span data-en="100% Natural Ingredients" data-vi="100% Nguyên liệu tự nhiên">100% Nguyên liệu tự nhiên</span>
                            </li>
                            <li class="flex items-center gap-2 text-gray-600">
                                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                                </svg>
                                <span data-en="No Preservatives" data-vi="Không chất bảo quản">Không chất bảo quản</span>
                            </li>
                            <li class="flex items-center gap-2 text-gray-600">
                                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                                </svg>
                                <span data-en="HACCP Certified" data-vi="Chứng nhận HACCP">Chứng nhận HACCP</span>
                            </li>
                            <li class="flex items-center gap-2 text-gray-600">
                                <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                                </svg>
                                <span data-en="Fresh Daily" data-vi="Tươi mỗi ngày">Tươi mỗi ngày</span>
                            </li>
                        </ul>
                    </div>
                    
                    <!-- Quantity Selector -->
                    <div>
                        <!-- Product Variants -->
                        <div class="mb-4">
                            <label class="block text-sm font-semibold mb-2" data-en="Options" data-vi="Tùy chọn">Tùy chọn</label>
                            <div class="flex flex-wrap gap-2">
                                <button class="px-4 py-2 border-2 border-primary bg-primary/10 text-primary rounded-lg font-semibold transition variant-option active">
                                    <span data-en="Standard (500g)" data-vi="Tiêu chuẩn (500g)">Tiêu chuẩn (500g)</span>
                                </button>
                                <button class="px-4 py-2 border-2 border-gray-200 hover:border-primary hover:bg-primary/5 rounded-lg font-semibold transition variant-option">
                                    <span data-en="Family Pack (1kg)" data-vi="Gói gia đình (1kg)">Gói gia đình (1kg)</span>
                                </button>
                                <button class="px-4 py-2 border-2 border-gray-200 hover:border-primary hover:bg-primary/5 rounded-lg font-semibold transition variant-option">
                                    <span data-en="Gift Box (750g)" data-vi="Hộp quà (750g)">Hộp quà (750g)</span>
                                </button>
                            </div>
                        </div>
                        
                        <label class="block text-sm font-semibold mb-2" data-en="Quantity" data-vi="Số lượng">Số lượng</label>
                        <div class="flex items-center gap-4">
                            <div class="flex items-center border-2 border-gray-200 rounded-lg">
                                <button id="decreaseQty" class="px-4 py-2 hover:bg-gray-100 transition">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                                    </svg>
                                </button>
                                <input type="number" id="productQty" value="1" min="1" max="99" class="w-16 text-center border-x-2 border-gray-200 py-2 font-semibold">
                                <button id="increaseQty" class="px-4 py-2 hover:bg-gray-100 transition">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                    </svg>
                                </button>
                            </div>
                            <span class="text-gray-500" data-en="kg" data-vi="kg">kg</span>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex flex-col sm:flex-row gap-3">
                        <button id="modalAddToCart" class="flex-1 py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-semibold text-lg flex items-center justify-center gap-2">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                            <span data-en="Add to Cart" data-vi="Thêm vào giỏ">Thêm vào giỏ</span>
                        </button>
                        <button id="addToWishlist" class="px-6 py-4 border-2 border-gray-300 rounded-xl hover:border-primary hover:text-primary transition flex items-center justify-center gap-2">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                        </button>
                        <button id="addToCompare" class="px-6 py-4 border-2 border-gray-300 rounded-xl hover:border-primary hover:text-primary transition flex items-center justify-center gap-2">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Social Share -->
                    <div class="pt-4 border-t border-gray-200">
                        <p class="text-sm text-gray-600 mb-3" data-en="Share this product:" data-vi="Chia sẻ sản phẩm:">Chia sẻ sản phẩm:</p>
                        <div class="flex gap-2">
                            <button class="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition" title="Share on Facebook">
                                <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </button>
                            <button class="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition" title="Share on Zalo">
                                <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><text x="2" y="18" font-size="18" font-weight="bold">Z</text></svg>
                            </button>
                            <button class="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition" title="Copy Link">
                                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Related Products -->
            <div class="mt-12 pt-8 border-t border-gray-200">
                <h3 class="text-2xl font-bold mb-6" data-en="Related Products" data-vi="Sản phẩm liên quan">Sản phẩm liên quan</h3>
                <div id="relatedProducts" class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <!-- Related products will be injected here -->
                </div>
            </div>
        `;

        // Attach modal-specific event listeners
        this.attachModalEventListeners(product);
        
        // Show modal with animation
        this.modal.classList.remove('hidden');
        setTimeout(() => this.modal.classList.add('opacity-100'), 10);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Load related products
        this.loadRelatedProducts(product);
    }

    /**
     * Attach modal-specific event listeners
     */
    attachModalEventListeners(product) {
        // Product Variant Selection
        document.querySelectorAll('.variant-option').forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active from all
                document.querySelectorAll('.variant-option').forEach(b => {
                    b.classList.remove('active', 'border-primary', 'bg-primary/10', 'text-primary');
                    b.classList.add('border-gray-200');
                });
                // Add active to clicked
                btn.classList.add('active', 'border-primary', 'bg-primary/10', 'text-primary');
                btn.classList.remove('border-gray-200');
            });
        });
        
        // Quantity controls
        const qtyInput = document.getElementById('productQty');
        const decreaseBtn = document.getElementById('decreaseQty');
        const increaseBtn = document.getElementById('increaseQty');
        
        decreaseBtn?.addEventListener('click', () => {
            const current = parseInt(qtyInput.value);
            if (current > 1) qtyInput.value = current - 1;
        });
        
        increaseBtn?.addEventListener('click', () => {
            const current = parseInt(qtyInput.value);
            if (current < 99) qtyInput.value = current + 1;
        });
        
        // Add to cart from modal
        document.getElementById('modalAddToCart')?.addEventListener('click', () => {
            const quantity = parseInt(qtyInput.value);
            this.addToCartFromModal(product, quantity);
        });
        
        // Wishlist
        document.getElementById('addToWishlist')?.addEventListener('click', () => {
            this.toggleWishlist(product);
        });
        
        // Compare
        document.getElementById('addToCompare')?.addEventListener('click', () => {
            this.toggleCompare(product);
        });
    }

    /**
     * Load related products
     */
    loadRelatedProducts(currentProduct) {
        const relatedContainer = document.getElementById('relatedProducts');
        if (!relatedContainer) return;

        // Get all products except current
        const allProducts = Array.from(document.querySelectorAll('.product-card')).slice(0, 4);
        
        relatedContainer.innerHTML = allProducts.map(card => {
            const button = card.querySelector('.add-to-cart');
            const img = card.querySelector('img');
            const title = card.querySelector('.product-info h3');
            const price = card.querySelector('.text-primary');
            
            if (!button || button.dataset.productId === currentProduct.id) return '';
            
            return `
                <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer" data-product-id="${button.dataset.productId}">
                    <div class="aspect-square overflow-hidden">
                        <img src="${button.dataset.productImage}" alt="${button.dataset.productName}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-300">
                    </div>
                    <div class="p-3">
                        <h4 class="font-semibold text-sm mb-2 line-clamp-2">${button.dataset.productName}</h4>
                        <p class="text-primary font-bold">${this.formatPrice(parseInt(button.dataset.productPrice))}</p>
                    </div>
                </div>
            `;
        }).filter(Boolean).join('');
        
        // Add click handlers to related products
        relatedContainer.querySelectorAll('[data-product-id]').forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.dataset.productId;
                const originalCard = document.querySelector(`[data-product-id="${productId}"]`);
                const button = originalCard?.querySelector('.add-to-cart');
                if (button) {
                    this.showProductDetails({
                        id: button.dataset.productId,
                        name: button.dataset.productName,
                        price: parseInt(button.dataset.productPrice),
                        image: button.dataset.productImage,
                        description: originalCard.querySelector('.product-info p')?.textContent || '',
                        badge: originalCard.querySelector('[class*="bg-"]')?.textContent?.trim() || ''
                    });
                }
            });
        });
    }

    /**
     * Add to cart from modal with quantity
     */
    addToCartFromModal(product, quantity) {
        const event = new CustomEvent('addToCart', {
            detail: { ...product, quantity }
        });
        document.dispatchEvent(event);
        
        this.showNotification('success', `Đã thêm ${quantity}kg vào giỏ hàng!`);
    }

    /**
     * Toggle wishlist
     */
    toggleWishlist(product) {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const exists = wishlist.find(p => p.id === product.id);
        
        if (exists) {
            const filtered = wishlist.filter(p => p.id !== product.id);
            localStorage.setItem('wishlist', JSON.stringify(filtered));
            this.showNotification('info', 'Đã xóa khỏi yêu thích');
            document.getElementById('addToWishlist')?.classList.remove('bg-red-50', 'border-red-500', 'text-red-600');
        } else {
            wishlist.push(product);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            this.showNotification('success', 'Đã thêm vào yêu thích!');
            document.getElementById('addToWishlist')?.classList.add('bg-red-50', 'border-red-500', 'text-red-600');
        }
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('wishlistUpdated'));
    }

    /**
     * Toggle compare
     */
    toggleCompare(product) {
        const compare = JSON.parse(localStorage.getItem('compare') || '[]');
        const exists = compare.find(p => p.id === product.id);
        
        if (exists) {
            const filtered = compare.filter(p => p.id !== product.id);
            localStorage.setItem('compare', JSON.stringify(filtered));
            this.showNotification('info', 'Đã xóa khỏi so sánh');
            document.getElementById('addToCompare')?.classList.remove('bg-blue-50', 'border-blue-500', 'text-blue-600');
        } else {
            if (compare.length >= 3) {
                this.showNotification('error', 'Chỉ có thể so sánh tối đa 3 sản phẩm');
                return;
            }
            compare.push(product);
            localStorage.setItem('compare', JSON.stringify(compare));
            this.showNotification('success', 'Đã thêm vào so sánh!');
            document.getElementById('addToCompare')?.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-600');
        }
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('compareUpdated'));
    }

    /**
     * Close modal
     */
    closeModal() {
        this.modal?.classList.add('hidden');
        document.body.style.overflow = '';
        this.currentProduct = null;
    }

    /**
     * Render star rating
     */
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let html = '';
        for (let i = 0; i < fullStars; i++) {
            html += '<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
        }
        if (halfStar) {
            html += '<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" opacity="0.5"/></svg>';
        }
        for (let i = 0; i < emptyStars; i++) {
            html += '<svg class="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
        }
        return html;
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

export default ProductDetailsManager;
