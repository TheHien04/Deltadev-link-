/**
 * Product Comparison Feature (2026)
 * Compare up to 4 products side-by-side
 * @module ProductComparison
 */

export class ProductComparison {
  constructor() {
    this.products = [];
    this.maxProducts = 4;
    this.storageKey = 'comparison';
    
    // Comparison attributes
    this.attributes = [
      { key: 'image', label: 'Hình ảnh', type: 'image' },
      { key: 'name', label: 'Tên sản phẩm', type: 'text' },
      { key: 'price', label: 'Giá', type: 'price' },
      { key: 'weight', label: 'Trọng lượng', type: 'text' },
      { key: 'flavor', label: 'Hương vị', type: 'text' },
      { key: 'ingredients', label: 'Thành phần', type: 'list' },
      { key: 'rating', label: 'Đánh giá', type: 'rating' },
      { key: 'reviews', label: 'Số review', type: 'number' },
      { key: 'inStock', label: 'Tình trạng', type: 'boolean' },
      { key: 'description', label: 'Mô tả', type: 'text' }
    ];
  }

  /**
   * Initialize comparison
   */
  init() {
    this.load();
    this.attachEventListeners();
    this.updateUI();
    
    console.log('[ProductComparison] Initialized with', this.products.length, 'products');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Compare button clicks
    document.addEventListener('click', (e) => {
      const compareBtn = e.target.closest('[data-compare-toggle]');
      if (compareBtn) {
        e.preventDefault();
        e.stopPropagation();
        
        const productId = compareBtn.dataset.productId;
        this.toggle(productId);
      }
    });

    // View comparison button
    const viewBtn = document.getElementById('viewComparison');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => this.openComparison());
    }

    // Clear comparison button
    const clearBtn = document.getElementById('clearComparison');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clear());
    }
  }

  /**
   * Add product to comparison
   */
  add(product) {
    // Check if already in comparison
    if (this.has(product.id)) {
      console.log('[ProductComparison] Product already in comparison:', product.id);
      return false;
    }

    // Check max products limit
    if (this.products.length >= this.maxProducts) {
      this.showNotification('warning', `Tối đa so sánh ${this.maxProducts} sản phẩm. Vui lòng xóa sản phẩm khác.`);
      return false;
    }

    // Add to comparison
    this.products.push(product);

    // Save & update UI
    this.save();
    this.updateUI();
    this.updateButtonState(product.id, true);

    // Show notification
    this.showNotification('success', '✅ Đã thêm vào so sánh');

    // Auto-open comparison if 2+ products
    if (this.products.length >= 2) {
      setTimeout(() => {
        this.openComparison();
      }, 500);
    }

    // Analytics
    if (window.gtag) {
      gtag('event', 'add_to_comparison', {
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price
        }]
      });
    }

    return true;
  }

  /**
   * Remove product from comparison
   */
  remove(productId) {
    const index = this.products.findIndex(p => p.id === productId);
    
    if (index === -1) {
      console.log('[ProductComparison] Product not in comparison:', productId);
      return false;
    }

    // Remove product
    this.products.splice(index, 1);

    // Save & update UI
    this.save();
    this.updateUI();
    this.updateButtonState(productId, false);

    // Show notification
    this.showNotification('info', 'Đã xóa khỏi so sánh');

    // Re-render comparison if modal isopen
    const modal = document.getElementById('comparisonModal');
    if (modal && !modal.classList.contains('hidden')) {
      this.renderComparisonModal();
    }

    return true;
  }

  /**
   * Toggle product in comparison
   */
  toggle(productId) {
    if (this.has(productId)) {
      this.remove(productId);
    } else {
      // Need full product data - dispatch event
      document.dispatchEvent(new CustomEvent('comparisonToggle', {
        detail: { productId, action: 'add' }
      }));
    }
  }

  /**
   * Check if product is in comparison
   */
  has(productId) {
    return this.products.some(p => p.id === productId);
  }

  /**
   * Get all comparison products
   */
  getProducts() {
    return [...this.products];
  }

  /**
   * Get comparison count
   */
  getCount() {
    return this.products.length;
  }

  /**
   * Clear all comparison products
   */
  clear() {
    if (this.products.length === 0) {
      return;
    }

    if (!confirm('Xóa tất cả sản phẩm so sánh?')) {
      return;
    }

    this.products = [];
    this.save();
    this.updateUI();

    this.showNotification('success', 'Đã xóa tất cả sản phẩm so sánh');
  }

  /**
   * Open comparison modal
   */
  openComparison() {
    if (this.products.length < 2) {
      this.showNotification('warning', 'Vui lòng chọn ít nhất 2 sản phẩm để so sánh');
      return;
    }

    this.renderComparisonModal();

    // Analytics
    if (window.gtag) {
      gtag('event', 'view_comparison', {
        product_count: this.products.length
      });
    }
  }

  /**
   * Render comparison modal
   */
  renderComparisonModal() {
    // Check if modal exists
    let modal = document.getElementById('comparisonModal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'comparisonModal';
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4';
      document.body.appendChild(modal);
    }

    // Render content
    modal.innerHTML = `
      <div class="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold">📊 So Sánh Sản Phẩm</h2>
            <p class="text-blue-100 text-sm">${this.products.length} sản phẩm</p>
          </div>
          <button id="closeComparisonModal" class="text-white hover:text-blue-200 transition">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="overflow-x-auto overflow-y-auto max-h-[calc(90vh-140px)]">
          ${this.renderComparisonTable()}
        </div>

        <!-- Footer -->
        <div class="p-6 border-t bg-gray-50 flex gap-3 justify-between">
          <button onclick="window.productComparison && window.productComparison.clear()" 
                  class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
            🗑️ Xóa tất cả
          </button>
          <div class="flex gap-3">
            <button onclick="window.productComparison && window.productComparison.exportComparison()" 
                    class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              📤 Xuất PDF
            </button>
            <button onclick="window.productComparison && window.productComparison.shareComparison()" 
                    class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
              🔗 Chia sẻ
            </button>
          </div>
        </div>
      </div>
    `;

    // Show modal
    modal.classList.remove('hidden');

    // Close modal handler
    const closeBtn = modal.querySelector('#closeComparisonModal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
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
   * Render comparison table
   */
  renderComparisonTable() {
    return `
      <table class="w-full">
        <thead>
          <tr class="bg-gray-100 sticky top-0 z-10">
            <th class="p-4 text-left font-semibold min-w-[200px]">Tiêu chí</th>
            ${this.products.map(product => `
              <th class="p-4 text-center relative min-w-[250px]">
                <button onclick="window.productComparison && window.productComparison.remove('${product.id}')" 
                        class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${this.attributes.map((attr, index) => `
            <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
              <td class="p-4 font-medium text-gray-700">${attr.label}</td>
              ${this.products.map(product => `
                <td class="p-4 text-center">
                  ${this.renderAttributeValue(product, attr)}
                </td>
              `).join('')}
            </tr>
          `).join('')}
          
          <!-- Actions Row -->
          <tr class="bg-gray-100">
            <td class="p-4 font-medium">Thao tác</td>
            ${this.products.map(product => `
              <td class="p-4 text-center">
                <button onclick="window.addToCart && window.addToCart('${product.id}')" 
                        class="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition mb-2">
                  🛒 Thêm vào giỏ
                </button>
                <button onclick="window.location.href='#product-${product.id}'" 
                        class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                  👁️ Xem chi tiết
                </button>
              </td>
            `).join('')}
          </tr>
        </tbody>
      </table>
    `;
  }

  /**
   * Render attribute value based on type
   */
  renderAttributeValue(product, attribute) {
    const value = product[attribute.key];

    switch (attribute.type) {
      case 'image':
        return `<img src="${value || '/placeholder.jpg'}" alt="${product.name}" class="w-32 h-32 object-cover rounded-lg mx-auto">`;
      
      case 'price':
        return `<span class="text-2xl font-bold text-primary">${this.formatPrice(value)}</span>`;
      
      case 'rating':
        return this.renderStars(value || 0);
      
      case 'number':
        return `<span class="text-lg font-semibold">${value || 0}</span>`;
      
      case 'boolean':
        return value ? 
          `<span class="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            Còn hàng
          </span>` :
          `<span class="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
            Hết hàng
          </span>`;
      
      case 'list':
        return Array.isArray(value) ? 
          `<ul class="text-left text-sm">${value.map(item => `<li>• ${item}</li>`).join('')}</ul>` :
          `<span class="text-gray-400">-</span>`;
      
      case 'text':
      default:
        return value ? `<span class="text-sm">${value}</span>` : `<span class="text-gray-400">-</span>`;
    }
  }

  /**
   * Render star rating
   */
  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return `
      <div class="flex items-center justify-center gap-1">
        ${Array(fullStars).fill('⭐').join('')}
        ${hasHalfStar ? '✨' : ''}
        ${Array(emptyStars).fill('☆').join('')}
        <span class="ml-2 text-sm text-gray-600">(${rating.toFixed(1)})</span>
      </div>
    `;
  }

  /**
   * Export comparison as PDF
   */
  exportComparison() {
    // TODO: Implement PDF export using jsPDF or similar
    this.showNotification('info', 'Tính năng xuất PDF đang được phát triển');
    
    // Analytics
    if (window.gtag) {
      gtag('event', 'export_comparison', {
        format: 'pdf',
        product_count: this.products.length
      });
    }
  }

  /**
   * Share comparison
   */
  async shareComparison() {
    const shareData = {
      title: 'So sánh sản phẩm - DeltaDev Link',
      text: `So sánh ${this.products.length} sản phẩm: ${this.products.map(p => p.name).join(', ')}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('[ProductComparison] Shared successfully');
      } catch (error) {
        console.log('[ProductComparison] Share cancelled');
      }
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(window.location.href);
      this.showNotification('success', '📋 Đã copy link');
    }

    // Analytics
    if (window.gtag) {
      gtag('event', 'share', {
        method: 'comparison',
        content_type: 'product_comparison',
        item_id: this.products.map(p => p.id).join(',')
      });
    }
  }

  /**
   * Update UI (badges, buttons)
   */
  updateUI() {
    // Update badge count
    const badge = document.getElementById('comparisonBadge');
    if (badge) {
      const count = this.getCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }

    // Update all comparison buttons
    document.querySelectorAll('[data-compare-toggle]').forEach(btn => {
      const productId = btn.dataset.productId;
      const inComparison = this.has(productId);
      this.updateButtonState(productId, inComparison, btn);
    });
  }

  /**
   * Update single button state
   */
  updateButtonState(productId, inComparison, button = null) {
    const buttons = button ? [button] : document.querySelectorAll(`[data-compare-toggle][data-product-id="${productId}"]`);
    
    buttons.forEach(btn => {
      if (inComparison) {
        btn.classList.add('active', 'bg-blue-500', 'text-white');
        btn.textContent = '✓ Đang so sánh';
      } else {
        btn.classList.remove('active', 'bg-blue-500', 'text-white');
        btn.textContent = '📊 So sánh';
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
      console.log(`[ProductComparison] ${type}:`, message);
    }
  }

  /**
   * Save to localStorage
   */
  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.products));
      console.log('[ProductComparison] Saved', this.products.length, 'products');
    } catch (error) {
      console.error('[ProductComparison] Save failed:', error);
    }
  }

  /**
   * Load from localStorage
   */
  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.products = JSON.parse(data);
        console.log('[ProductComparison] Loaded', this.products.length, 'products');
      }
    } catch (error) {
      console.error('[ProductComparison] Load failed:', error);
      this.products = [];
    }
  }

  /**
   * Create comparison button for product card
   */
  static createButton(productId) {
    const button = document.createElement('button');
    button.className = 'compare-btn px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm';
    button.setAttribute('data-compare-toggle', '');
    button.setAttribute('data-product-id', productId);
    button.textContent = '📊 So sánh';
    return button;
  }
}

// Export singleton instance
export default new ProductComparison();
