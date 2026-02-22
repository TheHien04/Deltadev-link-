/**
 * Product Comparison Manager
 * Handles product comparison functionality
 * @module managers/ComparisonManager
 */

export class ComparisonManager {
    constructor(appState, config) {
        this.appState = appState;
        this.config = config;
        this.compareList = [];
        this.maxCompare = 3;
        this.panel = null;
        this.button = null;
    }

    /**
     * Initialize comparison manager
     */
    init() {
        console.log('[ComparisonManager] Initializing...');
        
        this.loadCompareList();
        this.createComparisonUI();
        this.attachEventListeners();
        this.updateCompareCount();
        
        console.log('[ComparisonManager] Initialized with', this.compareList.length, 'items');
    }

    /**
     * Load comparison list from localStorage
     */
    loadCompareList() {
        try {
            const saved = localStorage.getItem('compare');
            this.compareList = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('[ComparisonManager] Failed to load compare list:', error);
            this.compareList = [];
        }
    }

    /**
     * Save comparison list to localStorage
     */
    saveCompareList() {
        try {
            localStorage.setItem('compare', JSON.stringify(this.compareList));
        } catch (error) {
            console.error('[ComparisonManager] Failed to save compare list:', error);
        }
    }

    /**
     * Create comparison UI (button + modal)
     */
    createComparisonUI() {
        // Create comparison button in navbar
        const nav = document.querySelector('nav .container');
        if (nav) {
            const compareBtn = document.createElement('button');
            compareBtn.id = 'compareButton';
            compareBtn.className = 'relative p-2 hover:text-primary transition hidden';
            compareBtn.innerHTML = `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                <span id="compareCount" class="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
            `;
            
            // Insert before wishlist or cart button
            const wishlistBtn = document.getElementById('wishlistButton');
            const cartBtn = document.querySelector('[data-cart-button]');
            const beforeElement = wishlistBtn || cartBtn;
            
            if (beforeElement) {
                beforeElement.parentNode.insertBefore(compareBtn, beforeElement);
            } else {
                nav.appendChild(compareBtn);
            }
            this.button = compareBtn;
        }

        // Create comparison modal
        const modal = document.createElement('div');
        modal.id = 'comparisonModal';
        modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm hidden z-[100] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-y-auto relative">
                <!-- Close Button -->
                <button id="closeComparisonModal" class="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition z-10">
                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>

                <!-- Comparison Content -->
                <div class="p-6 md:p-8">
                    <h2 class="text-3xl font-bold mb-6 flex items-center gap-2">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        <span data-en="Compare Products" data-vi="So sánh sản phẩm">So sánh sản phẩm</span>
                    </h2>
                    
                    <!-- Empty State -->
                    <div id="comparisonEmpty" class="text-center py-12 hidden">
                        <svg class="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        <p class="text-gray-500" data-en="Add products to compare" data-vi="Thêm sản phẩm để so sánh">Thêm sản phẩm để so sánh (tối đa 3)</p>
                    </div>
                    
                    <!-- Comparison Table -->
                    <div id="comparisonTable" class="hidden">
                        <!-- Table will be injected here -->
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.panel = modal;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Open comparison modal
        this.button?.addEventListener('click', () => this.openComparison());
        
        // Close comparison modal
        document.getElementById('closeComparisonModal')?.addEventListener('click', () => this.closeComparison());
        
        // Close on outside click
        this.panel?.addEventListener('click', (e) => {
            if (e.target === this.panel) this.closeComparison();
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.panel?.classList.contains('hidden')) {
                this.closeComparison();
            }
        });
        
        // Listen for compare updates from other managers
        document.addEventListener('compareUpdated', () => {
            this.loadCompareList();
            this.updateCompareCount();
            this.renderComparison();
        });
    }

    /**
     * Toggle product in comparison
     */
    toggleCompare(product) {
        const exists = this.compareList.find(p => p.id === product.id);
        
        if (exists) {
            this.compareList = this.compareList.filter(p => p.id !== product.id);
            this.showNotification('info', 'Đã xóa khỏi so sánh');
        } else {
            if (this.compareList.length >= this.maxCompare) {
                this.showNotification('error', `Chỉ có thể so sánh tối đa ${this.maxCompare} sản phẩm`);
                return false;
            }
            this.compareList.push(product);
            this.showNotification('success', '✓ Đã thêm vào so sánh!');
        }
        
        this.saveCompareList();
        this.updateCompareCount();
        this.renderComparison();
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('compareUpdated'));
        
        return true;
    }

    /**
     * Update comparison count badge
     */
    updateCompareCount() {
        const count = this.compareList.length;
        const countBadge = document.getElementById('compareCount');
        
        if (countBadge) {
            countBadge.textContent = count;
        }
        
        // Show/hide compare button
        if (this.button) {
            this.button.classList.toggle('hidden', count === 0);
        }
    }

    /**
     * Render comparison table
     */
    renderComparison() {
        const table = document.getElementById('comparisonTable');
        const emptyState = document.getElementById('comparisonEmpty');
        
        if (!table || !emptyState) return;
        
        if (this.compareList.length === 0) {
            table.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }
        
        table.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        // Build comparison table
        table.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="border-b-2 border-gray-200">
                            <th class="p-4 text-left font-semibold sticky left-0 bg-white z-10">
                                <span data-en="Feature" data-vi="Đặc điểm">Đặc điểm</span>
                            </th>
                            ${this.compareList.map(product => `
                                <th class="p-4 text-center min-w-[200px]">
                                    <div class="relative">
                                        <button class="remove-from-compare absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition" data-product-id="${product.id}">×</button>
                                        <img src="${product.image}" alt="${product.name}" class="w-32 h-32 object-cover rounded-lg mx-auto mb-3">
                                        <h3 class="font-bold text-sm">${product.name}</h3>
                                    </div>
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-b border-gray-100">
                            <td class="p-4 font-semibold sticky left-0 bg-white" data-en="Price" data-vi="Giá">Giá</td>
                            ${this.compareList.map(product => `
                                <td class="p-4 text-center">
                                    <span class="text-primary font-bold text-lg">${this.formatPrice(product.price)}</span>
                                </td>
                            `).join('')}
                        </tr>
                        <tr class="border-b border-gray-100">
                            <td class="p-4 font-semibold sticky left-0 bg-white" data-en="Rating" data-vi="Đánh giá">Đánh giá</td>
                            ${this.compareList.map(() => `
                                <td class="p-4 text-center">
                                    <div class="flex justify-center gap-1">
                                        ${this.renderStars(4.8)}
                                    </div>
                                    <span class="text-sm text-gray-500">(127)</span>
                                </td>
                            `).join('')}
                        </tr>
                        <tr class="border-b border-gray-100">
                            <td class="p-4 font-semibold sticky left-0 bg-white" data-en="Natural Ingredients" data-vi="Nguyên liệu tự nhiên">Nguyên liệu tự nhiên</td>
                            ${this.compareList.map(() => `
                                <td class="p-4 text-center">
                                    <svg class="w-6 h-6 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                </td>
                            `).join('')}
                        </tr>
                        <tr class="border-b border-gray-100">
                            <td class="p-4 font-semibold sticky left-0 bg-white" data-en="No Preservatives" data-vi="Không chất bảo quản">Không chất bảo quản</td>
                            ${this.compareList.map(() => `
                                <td class="p-4 text-center">
                                    <svg class="w-6 h-6 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                </td>
                            `).join('')}
                        </tr>
                        <tr class="border-b border-gray-100">
                            <td class="p-4 font-semibold sticky left-0 bg-white" data-en="HACCP Certified" data-vi="Chứng nhận HACCP">Chứng nhận HACCP</td>
                            ${this.compareList.map(() => `
                                <td class="p-4 text-center">
                                    <svg class="w-6 h-6 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                </td>
                            `).join('')}
                        </tr>
                        <tr class="border-b border-gray-100">
                            <td class="p-4 font-semibold sticky left-0 bg-white" data-en="Fresh Daily" data-vi="Tươi mỗi ngày">Tươi mỗi ngày</td>
                            ${this.compareList.map(() => `
                                <td class="p-4 text-center">
                                    <svg class="w-6 h-6 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                    </svg>
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td class="p-4 font-semibold sticky left-0 bg-white" data-en="Action" data-vi="Hành động">Hành động</td>
                            ${this.compareList.map(product => `
                                <td class="p-4 text-center">
                                    <button class="add-to-cart-from-compare px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition w-full" data-product='${JSON.stringify(product)}'>
                                        <span data-en="Add to Cart" data-vi="Thêm vào giỏ">Thêm vào giỏ</span>
                                    </button>
                                </td>
                            `).join('')}
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="mt-6 flex justify-center">
                <button id="clearComparison" class="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:text-red-500 transition">
                    <span data-en="Clear All" data-vi="Xóa tất cả">Xóa tất cả</span>
                </button>
            </div>
        `;
        
        // Attach event listeners
        table.querySelectorAll('.remove-from-compare').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = btn.dataset.productId;
                this.removeFromCompare(productId);
            });
        });
        
        table.querySelectorAll('.add-to-cart-from-compare').forEach(btn => {
            btn.addEventListener('click', () => {
                const product = JSON.parse(btn.dataset.product);
                document.dispatchEvent(new CustomEvent('addToCart', {
                    detail: { ...product, quantity: 1 }
                }));
                this.showNotification('success', 'Đã thêm vào giỏ hàng!');
            });
        });
        
        document.getElementById('clearComparison')?.addEventListener('click', () => {
            this.clearComparison();
        });
    }

    /**
     * Remove product from comparison
     */
    removeFromCompare(productId) {
        this.compareList = this.compareList.filter(p => p.id !== productId);
        this.saveCompareList();
        this.updateCompareCount();
        this.renderComparison();
        document.dispatchEvent(new CustomEvent('compareUpdated'));
    }

    /**
     * Clear all comparison
     */
    clearComparison() {
        this.compareList = [];
        this.saveCompareList();
        this.updateCompareCount();
        this.renderComparison();
        document.dispatchEvent(new CustomEvent('compareUpdated'));
        this.showNotification('info', 'Đã xóa tất cả');
    }

    /**
     * Open comparison modal
     */
    openComparison() {
        this.renderComparison();
        this.panel?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close comparison modal
     */
    closeComparison() {
        this.panel?.classList.add('hidden');
        document.body.style.overflow = '';
    }

    /**
     * Render star rating
     */
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        let html = '';
        for (let i = 0; i < fullStars; i++) {
            html += '<svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
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

export default ComparisonManager;
