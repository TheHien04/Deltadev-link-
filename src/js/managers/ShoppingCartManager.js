/**
 * Shopping Cart Manager
 * Handles shopping cart functionality
 * @module managers/ShoppingCartManager
 */

export class ShoppingCartManager {
    constructor(appState, config) {
        this.appState = appState;
        this.config = config;
        this.cart = [];
        this.cartElement = null;
        this.cartBadge = null;
        this.cartPanel = null;
        this.appliedVoucher = null;
        this.currentLanguage = 'vi';
    }

    /**
     * Initialize shopping cart
     */
    init() {
        console.log('[ShoppingCartManager] Initializing...');
        
        // Load language
        this.currentLanguage = this.appState.get('currentLanguage') || 'vi';
        
        // Listen for language changes
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            this.updateCartSummary(); // Refresh hints and messages
        });
        
        // Load cart from localStorage
        this.loadCart();
        
        // Create cart UI
        this.createCartUI();
        
        // Attach event listeners
        this.attachEventListeners();
        
        // Subscribe to state changes
        this.appState.subscribe('cart', (newCart) => {
            this.cart = newCart;
            this.updateCartUI();
            this.saveCart();
        });
        
        console.log('[ShoppingCartManager] Initialized successfully');
    }

    /**
     * Create cart UI elements
     */
    createCartUI() {
        // Create floating cart button
        const cartButton = document.createElement('button');
        cartButton.id = 'cartButton';
        cartButton.className = 'fixed bottom-6 left-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all transform hover:scale-110 z-50 flex items-center justify-center';
        cartButton.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span id="cartBadge" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center hidden">0</span>
        `;
        document.body.appendChild(cartButton);
        this.cartElement = cartButton;
        this.cartBadge = document.getElementById('cartBadge');

        // Create cart panel
        const cartPanel = document.createElement('div');
        cartPanel.id = 'cartPanel';
        cartPanel.className = 'fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl transform translate-x-full transition-transform duration-300 z-50 overflow-hidden flex flex-col';
        cartPanel.innerHTML = `
            <div class="bg-primary text-white p-6 flex justify-between items-center">
                <h3 class="text-xl font-bold" data-en="Shopping Cart" data-vi="Giỏ Hàng">Shopping Cart</h3>
                <button id="closeCart" class="text-white hover:text-gray-200 transition">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            
            <div id="cartItemsContainer" class="flex-1 overflow-y-auto p-6">
                <div id="emptyCart" class="text-center py-12">
                    <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <p class="text-gray-500" data-en="Your cart is empty" data-vi="Giỏ hàng trống">Your cart is empty</p>
                </div>
                <div id="cartItems" class="space-y-4"></div>
            </div>
            
            <div class="border-t p-6 bg-gray-50">
                <!-- Voucher input -->
                <div class="mb-4">
                    <div class="flex gap-2">
                        <input type="text" id="voucherInput" placeholder="Nhập mã giảm giá" 
                               class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                        <button id="applyVoucher" class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition">
                            <span data-en="Apply" data-vi="Áp dụng">Apply</span>
                        </button>
                    </div>
                    <div id="voucherMessage" class="text-sm mt-2"></div>
                </div>
                
                <!-- Bulk Discount Hint -->
                <div id="bulkDiscountHint" class="hidden text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-4"></div>
                
                <!-- Bulk Discount Message -->
                <div id="bulkDiscountMessage" class="hidden text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4 font-semibold"></div>
                
                <!-- Cart summary -->
                <div class="space-y-2 mb-4">
                    <div class="flex justify-between text-sm">
                        <span data-en="Subtotal" data-vi="Tạm tính">Subtotal</span>
                        <span id="cartSubtotal">0 VNĐ</span>
                    </div>
                    <div id="discountRow" class="flex justify-between text-sm text-green-600 hidden">
                        <span data-en="Discount" data-vi="Giảm giá">Discount</span>
                        <span id="cartDiscount">0 VNĐ</span>
                    </div>
                    <div class="flex justify-between text-lg font-bold border-t pt-2">
                        <span data-en="Total" data-vi="Tổng cộng">Total</span>
                        <span id="cartTotal" class="text-primary">0 VNĐ</span>
                    </div>
                </div>
                
                <button id="checkoutButton" class="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold">
                    <span data-en="Checkout via Zalo" data-vi="Đặt hàng qua Zalo">Checkout via Zalo</span>
                </button>
            </div>
        `;
        document.body.appendChild(cartPanel);
        this.cartPanel = cartPanel;

        // Create cart overlay
        const overlay = document.createElement('div');
        overlay.id = 'cartOverlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 hidden z-40';
        document.body.appendChild(overlay);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Open cart
        this.cartElement.addEventListener('click', () => this.openCart());

        // Close cart
        document.getElementById('closeCart').addEventListener('click', () => this.closeCart());
        document.getElementById('cartOverlay').addEventListener('click', () => this.closeCart());

        // Apply voucher
        document.getElementById('applyVoucher').addEventListener('click', () => this.applyVoucher());

        // Checkout
        document.getElementById('checkoutButton').addEventListener('click', () => this.checkout());

        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart')) {
                const button = e.target.closest('.add-to-cart');
                const productId = button.dataset.productId;
                const productName = button.dataset.productName;
                const productPrice = parseInt(button.dataset.productPrice);
                const productImage = button.dataset.productImage || '';
                
                this.addToCart({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
            }
        });
    }

    /**
     * Add item to cart
     */
    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            if (existingItem.quantity < this.config.cart.maxQuantityPerItem) {
                existingItem.quantity += 1;
            } else {
                this.showNotification('error', `Số lượng tối đa là ${this.config.cart.maxQuantityPerItem}`);
                return;
            }
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        
        this.appState.setState({ cart: this.cart });
        this.updateCartUI();
        this.showNotification('success', 'Đã thêm vào giỏ hàng!');
        
        // Animate cart button
        this.cartElement.classList.add('scale-110');
        setTimeout(() => this.cartElement.classList.remove('scale-110'), 300);
    }

    /**
     * Remove item from cart
     */
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.appState.setState({ cart: this.cart });
        this.updateCartUI();
    }

    /**
     * Update item quantity
     */
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity > 0 && quantity <= this.config.cart.maxQuantityPerItem) {
                item.quantity = quantity;
                this.appState.setState({ cart: this.cart });
                this.updateCartUI();
            } else if (quantity === 0) {
                this.removeFromCart(productId);
            }
        }
    }

    /**
     * Update cart UI
     */
    updateCartUI() {
        const cartItemsContainer = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        
        if (this.cart.length === 0) {
            emptyCart.classList.remove('hidden');
            cartItemsContainer.innerHTML = '';
            this.cartBadge.classList.add('hidden');
        } else {
            emptyCart.classList.add('hidden');
            this.cartBadge.classList.remove('hidden');
            this.cartBadge.textContent = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            
            cartItemsContainer.innerHTML = this.cart.map(item => `
                <div class="flex gap-4 border-b pb-4">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg">` : ''}
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800">${item.name}</h4>
                        <p class="text-sm text-primary font-bold">${this.formatPrice(item.price)}</p>
                        <div class="flex items-center gap-2 mt-2">
                            <button class="quantity-btn w-6 h-6 bg-gray-200 rounded hover:bg-gray-300" data-id="${item.id}" data-action="decrease">−</button>
                            <span class="w-8 text-center font-semibold">${item.quantity}</span>
                            <button class="quantity-btn w-6 h-6 bg-gray-200 rounded hover:bg-gray-300" data-id="${item.id}" data-action="increase">+</button>
                            <button class="remove-item ml-auto text-red-500 hover:text-red-700" data-id="${item.id}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Attach quantity buttons
            cartItemsContainer.querySelectorAll('.quantity-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    const action = btn.dataset.action;
                    const item = this.cart.find(i => i.id === id);
                    if (item) {
                        this.updateQuantity(id, action === 'increase' ? item.quantity + 1 : item.quantity - 1);
                    }
                });
            });
            
            // Attach remove buttons
            cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.removeFromCart(btn.dataset.id);
                });
            });
        }
        
        this.updateCartSummary();
    }

    /**
     * Update cart summary
     */
    updateCartSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalQuantity = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        let discount = 0;
        let bulkDiscount = 0;
        
        // Apply bulk discount based on total quantity
        if (totalQuantity >= 20) {
            bulkDiscount = subtotal * 0.15; // 15% off for 20kg+
        } else if (totalQuantity >= 10) {
            bulkDiscount = subtotal * 0.10; // 10% off for 10kg+
        } else if (totalQuantity >= 5) {
            bulkDiscount = subtotal * 0.05; // 5% off for 5kg+
        }
        
        discount += bulkDiscount;
        
        // Apply voucher discount
        if (this.appliedVoucher) {
            if (this.appliedVoucher.type === 'percentage') {
                discount += (subtotal - bulkDiscount) * (this.appliedVoucher.discount / 100);
            } else {
                discount += this.appliedVoucher.discount;
            }
        }
        
        const total = subtotal - discount;
        
        document.getElementById('cartSubtotal').textContent = this.formatPrice(subtotal);
        document.getElementById('cartTotal').textContent = this.formatPrice(total);
        
        // Show/hide discount row
        if (discount > 0) {
            document.getElementById('discountRow').classList.remove('hidden');
            document.getElementById('cartDiscount').textContent = `- ${this.formatPrice(discount)}`;
            
            // Show bulk discount message
            if (bulkDiscount > 0) {
                const bulkMsg = document.getElementById('bulkDiscountMessage');
                if (bulkMsg) {
                    let discountPercent = 0;
                    if (totalQuantity >= 20) discountPercent = 15;
                    else if (totalQuantity >= 10) discountPercent = 10;
                    else if (totalQuantity >= 5) discountPercent = 5;
                    
                    bulkMsg.textContent = this.currentLanguage === 'vi' 
                        ? `🎉 Giảm ${discountPercent}% mua ${totalQuantity}kg!`
                        : `🎉 ${discountPercent}% off for ${totalQuantity}kg!`;
                    bulkMsg.classList.remove('hidden');
                }
            }
        } else {
            document.getElementById('discountRow').classList.add('hidden');
        }
        
        // Show next bulk discount tier hint
        this.showBulkDiscountHint(totalQuantity, subtotal);
    }
    
    /**
     * Show hint for next bulk discount tier
     */
    showBulkDiscountHint(totalQuantity, subtotal) {
        const hintElement = document.getElementById('bulkDiscountHint');
        if (!hintElement) return;
        
        if (totalQuantity < 5) {
            const needed = 5 - totalQuantity;
            hintElement.textContent = this.currentLanguage === 'vi'
                ? `💡 Mua thêm ${needed}kg để được giảm 5%`
                : `💡 Buy ${needed}kg more for 5% off`;
            hintElement.classList.remove('hidden');
        } else if (totalQuantity < 10) {
            const needed = 10 - totalQuantity;
            hintElement.textContent = this.currentLanguage === 'vi'
                ? `💡 Mua thêm ${needed}kg để được giảm 10%`
                : `💡 Buy ${needed}kg more for 10% off`;
            hintElement.classList.remove('hidden');
        } else if (totalQuantity < 20) {
            const needed = 20 - totalQuantity;
            hintElement.textContent = this.currentLanguage === 'vi'
                ? `💡 Mua thêm ${needed}kg để được giảm 15%`
                : `💡 Buy ${needed}kg more for 15% off`;
            hintElement.classList.remove('hidden');
        } else {
            hintElement.classList.add('hidden');
        }
    }

    /**
     * Apply voucher
     */
    applyVoucher() {
        const voucherCode = document.getElementById('voucherInput').value.trim().toUpperCase();
        const voucherMessage = document.getElementById('voucherMessage');
        
        if (!voucherCode) {
            voucherMessage.className = 'text-sm mt-2 text-red-500';
            voucherMessage.textContent = 'Vui lòng nhập mã giảm giá';
            return;
        }
        
        const voucher = this.config.vouchers.find(v => v.code === voucherCode && v.active);
        
        if (!voucher) {
            voucherMessage.className = 'text-sm mt-2 text-red-500';
            voucherMessage.textContent = 'Mã giảm giá không hợp lệ';
            return;
        }
        
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (subtotal < voucher.minOrder) {
            voucherMessage.className = 'text-sm mt-2 text-red-500';
            voucherMessage.textContent = `Đơn hàng tối thiểu ${this.formatPrice(voucher.minOrder)}`;
            return;
        }
        
        this.appliedVoucher = voucher;
        voucherMessage.className = 'text-sm mt-2 text-green-600 font-semibold';
        voucherMessage.textContent = `✓ Đã áp dụng: ${voucher.description.vi}`;
        this.updateCartSummary();
        this.showNotification('success', 'Áp dụng mã thành công!');
    }

    /**
     * Checkout via Zalo
     */
    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('error', 'Giỏ hàng trống!');
            return;
        }
        
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discount = 0;
        
        if (this.appliedVoucher) {
            if (this.appliedVoucher.type === 'percentage') {
                discount = subtotal * (this.appliedVoucher.discount / 100);
            } else {
                discount = this.appliedVoucher.discount;
            }
        }
        
        const total = subtotal - discount;
        
        // Build order message
        let message = '🛒 ĐẶT HÀNG MỚI\n\n';
        message += '📦 Sản phẩm:\n';
        this.cart.forEach(item => {
            message += `• ${item.name} x${item.quantity} - ${this.formatPrice(item.price * item.quantity)}\n`;
        });
        message += `\n💰 Tạm tính: ${this.formatPrice(subtotal)}`;
        if (discount > 0) {
            message += `\n🎁 Giảm giá: -${this.formatPrice(discount)}`;
            message += `\n📌 Mã: ${this.appliedVoucher.code}`;
        }
        message += `\n\n✨ TỔNG CỘNG: ${this.formatPrice(total)}`;
        
        // Open Zalo
        const zaloUrl = `https://zalo.me/${this.config.contact.zaloNumber}?text=${encodeURIComponent(message)}`;
        window.open(zaloUrl, '_blank');
        
        this.showNotification('success', 'Đang chuyển sang Zalo...');
    }

    /**
     * Open cart panel
     */
    openCart() {
        this.cartPanel.classList.remove('translate-x-full');
        document.getElementById('cartOverlay').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close cart panel
     */
    closeCart() {
        this.cartPanel.classList.add('translate-x-full');
        document.getElementById('cartOverlay').classList.add('hidden');
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
        notification.className = `fixed top-24 right-8 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('opacity-0', 'translate-x-8');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Save cart to localStorage
     */
    saveCart() {
        localStorage.setItem('thesundaybite_cart', JSON.stringify(this.cart));
    }

    /**
     * Load cart from localStorage
     */
    loadCart() {
        const saved = localStorage.getItem('thesundaybite_cart');
        if (saved) {
            try {
                this.cart = JSON.parse(saved);
                this.appState.setState({ cart: this.cart });
            } catch (e) {
                console.error('[ShoppingCartManager] Failed to load cart:', e);
            }
        }
    }
}

export default ShoppingCartManager;
