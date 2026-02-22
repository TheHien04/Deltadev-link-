/**
 * Wishlist/Favorites Feature (2026)
 * Save products for later, sync across devices
 * @module Wishlist
 */

export class Wishlist {
  constructor() {
    this.items = [];
    this.storageKey = 'wishlist';
    this.maxItems = 50;
  }

  /**
   * Initialize wishlist
   */
  init() {
    this.load();
    this.attachEventListeners();
    this.updateUI();
    
    console.log('[Wishlist] Initialized with', this.items.length, 'items');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Wishlist button clicks (event delegation)
    document.addEventListener('click', (e) => {
      const wishlistBtn = e.target.closest('[data-wishlist-toggle]');
      if (wishlistBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        const productId = wishlistBtn.dataset.productId;
        this.toggle(productId);
      }
    });

    // View wishlist button
    const viewBtn = document.getElementById('viewWishlist');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => this.openWishlist());
    }

    // Clear wishlist button
    const clearBtn = document.getElementById('clearWishlist');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clear());
    }
  }

  /**
   * Add product to wishlist
   */
  add(product) {
    // Check if already in wishlist
    if (this.has(product.id)) {
      console.log('[Wishlist] Product already in wishlist:', product.id);
      return false;
    }

    // Check max items limit
    if (this.items.length >= this.maxItems) {
      this.showNotification('error', `Tối đa ${this.maxItems} sản phẩm yêu thích`);
      return false;
    }

    // Add to wishlist
    this.items.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      addedAt: Date.now()
    });

    // Save & update UI
    this.save();
    this.updateUI();
    this.updateButtonState(product.id, true);

    // Show notification
    this.showNotification('success', '💖 Đã thêm vào yêu thích');

    // Analytics
    if (window.gtag) {
      gtag('event', 'add_to_wishlist', {
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price
        }]
      });
    }

    if (window.fbq) {
      fbq('track', 'AddToWishlist', {
        content_ids: [product.id],
        content_name: product.name,
        value: product.price,
        currency: 'VND'
      });
    }

    return true;
  }

  /**
   * Remove product from wishlist
   */
  remove(productId) {
    const index = this.items.findIndex(item => item.id === productId);
    
    if (index === -1) {
      console.log('[Wishlist] Product not in wishlist:', productId);
      return false;
    }

    // Remove item
    this.items.splice(index, 1);

    // Save & update UI
    this.save();
    this.updateUI();
    this.updateButtonState(productId, false);

    // Show notification
    this.showNotification('info', 'Đã xóa khỏi yêu thích');

    return true;
  }

  /**
   * Toggle product in wishlist
   */
  toggle(productId) {
    if (this.has(productId)) {
      this.remove(productId);
    } else {
      // Need full product data - dispatch event to request it
      document.dispatchEvent(new CustomEvent('wishlistToggle', {
        detail: { productId, action: 'add' }
      }));
    }
  }

  /**
   * Check if product is in wishlist
   */
  has(productId) {
    return this.items.some(item => item.id === productId);
  }

  /**
   * Get all wishlist items
   */
  getItems() {
    return [...this.items];
  }

  /**
   * Get wishlist count
   */
  getCount() {
    return this.items.length;
  }

  /**
   * Clear all wishlist items
   */
  clear() {
    if (this.items.length === 0) {
      return;
    }

    if (!confirm('Xóa tất cả sản phẩm yêu thích?')) {
      return;
    }

    this.items = [];
    this.save();
    this.updateUI();

    this.showNotification('success', 'Đã xóa tất cả sản phẩm yêu thích');
  }

  /**
   * Open wishlist modal/page
   */
  openWishlist() {
    // Dispatch event for other components to handle
    document.dispatchEvent(new CustomEvent('openWishlist', {
      detail: { items: this.items }
    }));

    // Or render modal directly
    this.renderWishlistModal();
  }

  /**
   * Render wishlist modal
   */
  renderWishlistModal() {
    // Check if modal exists
    let modal = document.getElementById('wishlistModal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'wishlistModal';
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4';
      document.body.appendChild(modal);
    }

    // Render content
    modal.innerHTML = `
      <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <!-- Header -->
        <div class="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold">💖 Sản Phẩm Yêu Thích</h2>
            <p class="text-pink-100 text-sm">${this.items.length} sản phẩm</p>
          </div>
          <button id="closeWishlistModal" class="text-white hover:text-pink-200 transition">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          ${this.items.length === 0 ? `
            <div class="text-center py-12">
              <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              <p class="text-gray-500 text-lg">Chưa có sản phẩm yêu thích</p>
              <button class="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition" 
                      onclick="document.getElementById('wishlistModal').classList.add('hidden')">
                Khám phá sản phẩm
              </button>
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${this.items.map(item => `
                <div class="flex gap-4 p-4 border rounded-lg hover:shadow-md transition">
                  <img src="${item.image}" alt="${item.name}" class="w-24 h-24 object-cover rounded-lg">
                  <div class="flex-1">
                    <h3 class="font-semibold text-lg mb-1">${item.name}</h3>
                    <p class="text-primary font-bold text-xl mb-2">${this.formatPrice(item.price)}</p>
                    <div class="flex gap-2">
                      <button class="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition"
                              onclick="window.addToCart && window.addToCart('${item.id}')">
                        🛒 Thêm vào giỏ
                      </button>
                      <button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition"
                              onclick="window.wishlist && window.wishlist.remove('${item.id}')">
                        ❌ Xóa
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Footer Actions -->
            <div class="mt-6 flex gap-3 justify-between">
              <button id="clearWishlist" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                Xóa tất cả
              </button>
              <button class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                      onclick="window.addAllToCart && window.addAllToCart()">
                🛒 Thêm tất cả vào giỏ hàng
              </button>
            </div>
          `}
        </div>
      </div>
    `;

    // Show modal
    modal.classList.remove('hidden');

    // Close modal handler
    const closeBtn = modal.querySelector('#closeWishlistModal');
    const clearBtn = modal.querySelector('#clearWishlist');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clear();
        modal.classList.add('hidden');
      });
    }

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }

  /**
   * Update wishlist UI (badge, buttons)
   */
  updateUI() {
    // Update badge count
    const badge = document.getElementById('wishlistBadge');
    if (badge) {
      const count = this.getCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }

    // Update all wishlist buttons
    document.querySelectorAll('[data-wishlist-toggle]').forEach(btn => {
      const productId = btn.dataset.productId;
      const inWishlist = this.has(productId);
      this.updateButtonState(productId, inWishlist, btn);
    });
  }

  /**
   * Update single button state
   */
  updateButtonState(productId, inWishlist, button = null) {
    const buttons = button ? [button] : document.querySelectorAll(`[data-wishlist-toggle][data-product-id="${productId}"]`);
    
    buttons.forEach(btn => {
      if (inWishlist) {
        btn.classList.add('active', 'text-red-500');
        btn.innerHTML = `
          <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        `;
        btn.title = 'Xóa khỏi yêu thích';
      } else {
        btn.classList.remove('active', 'text-red-500');
        btn.innerHTML = `
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        `;
        btn.title = 'Thêm vào yêu thích';
      }
    });
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
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`[Wishlist] ${type}:`, message);
    }
  }

  /**
   * Save to localStorage
   */
  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      console.log('[Wishlist] Saved', this.items.length, 'items');
    } catch (error) {
      console.error('[Wishlist] Save failed:', error);
    }
  }

  /**
   * Load from localStorage
   */
  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.items = JSON.parse(data);
        console.log('[Wishlist] Loaded', this.items.length, 'items');
      }
    } catch (error) {
      console.error('[Wishlist] Load failed:', error);
      this.items = [];
    }
  }

  /**
   * Export wishlist (for sharing)
   */
  export() {
    return {
      items: this.items,
      count: this.items.length,
      exportedAt: Date.now()
    };
  }

  /**
   * Import wishlist (from sharing)
   */
  import(data) {
    if (!data || !Array.isArray(data.items)) {
      console.error('[Wishlist] Invalid import data');
      return false;
    }

    this.items = data.items;
    this.save();
    this.updateUI();

    this.showNotification('success', `Đã nhập ${this.items.length} sản phẩm yêu thích`);
    return true;
  }

  /**
   * Create wishlist button for product card
   */
  static createButton(productId) {
    const button = document.createElement('button');
    button.className = 'wishlist-btn absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition z-10';
    button.setAttribute('data-wishlist-toggle', '');
    button.setAttribute('data-product-id', productId);
    button.innerHTML = `
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
    `;
    return button;
  }
}

// Export singleton instance
export default new Wishlist();
