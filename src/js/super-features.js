/**
 * Super Features Integration Example
 * Complete integration code for all super features
 * @version 3.2.0
 */

// =============================================================================
// 1. IMPORTS
// =============================================================================

import { VoiceSearch } from './features/VoiceSearch.js';
import { AdvancedSearch } from './features/AdvancedSearch.js';
import { Wishlist } from './features/Wishlist.js';
import { ProductComparison } from './features/ProductComparison.js';
import { ProductReviews } from './features/ProductReviews.js';
import { ModernWebFeatures } from './services/ModernWebFeatures.js';
import { ENV, isFeatureEnabled } from './config/env.config.js';

// =============================================================================
// 2. SAMPLE PRODUCTS DATA
// =============================================================================

const sampleProducts = [
  {
    id: 'lap-xuong-gao-lut-001',
    name: 'Organic Brown Rice Artisan Link',
    nameEn: 'Organic Brown Rice Artisan Link',
    nameVi: 'Lạp Xưởng Gạo Lứt Hữu Cơ',
    price: 89000,
    weight: '500g',
    flavor: 'Vừa cay',
    category: 'Premium',
    tags: ['organic', 'healthy', 'gao-lut'],
    rating: 4.8,
    reviews: 124,
    inStock: true,
    image: '/src/assets/images/Product1.jpg',
    description: 'Lạp xưởng gạo lứt organic cao cấp từ Cái Bè, Tiền Giang...',
    ingredients: ['Gạo lứt hữu cơ', 'Thịt heo sạch', 'Gia vị tự nhiên']
  },
  {
    id: 'lap-xuong-truyen-thong-002',
    name: 'Heritage Classic Link',
    nameEn: 'Heritage Classic Link',
    nameVi: 'Lạp Xưởng Truyền Thống Cái Bè',
    price: 120000,
    weight: '1kg',
    flavor: 'Ngọt nhẹ',
    category: 'Classic',
    tags: ['traditional', 'bestseller'],
    rating: 4.9,
    reviews: 256,
    inStock: true,
    image: '/src/assets/images/Product2.jpg',
    description: 'Lạp xưởng truyền thống với công thức gia truyền...',
    ingredients: ['Thịt heo', 'Đường', 'Muối', 'Rượu trắng']
  },
  {
    id: 'lap-xuong-special-003',
    name: 'Signature Artisan Link',
    nameEn: 'Signature Artisan Link',
    nameVi: 'Lạp Xưởng Cao Cấp Đặc Biệt',
    price: 150000,
    weight: '500g',
    flavor: 'Cay nồng',
    category: 'Premium',
    tags: ['premium', 'spicy', 'limited-edition'],
    rating: 5.0,
    reviews: 89,
    inStock: true,
    image: '/src/assets/images/Product3.jpg',
    description: 'Phiên bản cao cấp với ớ hiểm và gia vị đặc biệt...',
    ingredients: ['Thịt heo thượng hạng', 'Ớt hiểm', 'Tỏi', 'Sả']
  }
];

// =============================================================================
// 3. INITIALIZATION
// =============================================================================

export class SuperFeaturesManager {
  constructor() {
    this.products = [];
    this.voiceSearch = null;
    this.advancedSearch = null;
    this.wishlist = null;
    this.productComparison = null;
    this.productReviews = null;
    this.modernFeatures = null;
  }

  /**
   * Initialize all super features
   */
  async init(products = sampleProducts) {
    console.log('%c🚀 Initializing Super Features...', 'color: #ff6384; font-size: 20px; font-weight: bold;');
    
    this.products = products;

    try {
      // 1. Voice Search
      try {
        await this.initVoiceSearch();
      } catch (err) {
        console.error('[SuperFeatures] Voice Search failed:', err);
      }

      // 2. Advanced Search
      try {
        await this.initAdvancedSearch();
      } catch (err) {
        console.error('[SuperFeatures] Advanced Search failed:', err);
      }

      // 3. Wishlist
      try {
        await this.initWishlist();
      } catch (err) {
        console.error('[SuperFeatures] Wishlist failed:', err);
      }

      // 4. Product Comparison
      try {
        await this.initProductComparison();
      } catch (err) {
        console.error('[SuperFeatures] Product Comparison failed:', err);
      }

      // 5. Product Reviews
      try {
        await this.initProductReviews();
      } catch (err) {
        console.error('[SuperFeatures] Product Reviews failed:', err);
      }

      // 6. Modern Web Features
      try {
        await this.initModernFeatures();
      } catch (err) {
        console.error('[SuperFeatures] Modern Web Features failed:', err);
      }

      // 7. Setup event listeners
      try {
        this.setupEventListeners();
      } catch (err) {
        console.error('[SuperFeatures] Setup event listeners failed:', err);
      }

      // 8. Initialize UI enhancements
      try {
        this.initUIEnhancements();
      } catch (err) {
        console.error('[SuperFeatures] UI enhancements failed:', err);
      }

      // Make available globally
      try {
        this.exposeGlobally();
      } catch (err) {
        console.error('[SuperFeatures] Expose globally failed:', err);
      }

      console.log('%c✅ Super Features Initialized!', 'color: #22c55e; font-size: 16px; font-weight: bold;');
      
      // Show welcome notification
      try {
        this.showWelcomeNotification();
      } catch (err) {
        console.warn('[SuperFeatures] Welcome notification failed:', err);
      }

    } catch (error) {
      console.error('[SuperFeatures] Critical initialization failed:', error);
      console.error('[SuperFeatures] Stack trace:', error.stack);
      alert('⚠️ Super Features failed to load. Check console (F12) for details.');
      throw error;
    }
  }

  /**
   * Initialize Voice Search
   */
  async initVoiceSearch() {
    if (!VoiceSearch.isSupported()) {
      console.warn('[VoiceSearch] Not supported in this browser');
      return;
    }

    // Instantiate VoiceSearch
    this.voiceSearch = new VoiceSearch();
    this.voiceSearch.init();

    // Create voice search button
    const searchContainer = document.getElementById('searchContainer');
    if (searchContainer) {
      VoiceSearch.createButton('searchContainer');
      console.log('✅ Voice Search initialized');
    }

    // Listen to voice search events
    document.addEventListener('voiceSearchQuery', (e) => {
      const { query } = e.detail;
      console.log('[VoiceSearch] Query:', query);
      
      // Trigger advanced search
      if (this.advancedSearch) {
        this.advancedSearch.search(query);
      }
    });
  }

  /**
   * Initialize Advanced Search
   */
  async initAdvancedSearch() {
    this.advancedSearch = new AdvancedSearch(this.products);
    this.advancedSearch.init();
    console.log('✅ Advanced Search initialized');

    // Listen to search results
    document.addEventListener('searchResultsUpdated', (e) => {
      const { products, count } = e.detail;
      console.log(`[AdvancedSearch] Found ${count} products`);
      
      // Render products (implement your own renderProducts function)
      this.renderProducts(products);
    });
  }

  /**
   * Initialize Wishlist
   */
  async initWishlist() {
    this.wishlist = new Wishlist();
    this.wishlist.init();
    console.log('✅ Wishlist initialized');

    // Listen to wishlist toggle events
    document.addEventListener('wishlistToggle', (e) => {
      const { productId, action } = e.detail;
      
      if (action === 'add') {
        // Find product
        const product = this.products.find(p => p.id === productId);
        if (product) {
          this.wishlist.add(product);
        }
      }
    });

    // Add wishlist buttons to all product cards
    this.addWishlistButtons();
  }

  /**
   * Initialize Product Comparison
   */
  async initProductComparison() {
    this.productComparison = new ProductComparison();
    this.productComparison.init();
    console.log('✅ Product Comparison initialized');

    // Listen to comparison toggle events
    document.addEventListener('comparisonToggle', (e) => {
      const { productId, action } = e.detail;
      
      if (action === 'add') {
        // Find product
        const product = this.products.find(p => p.id === productId);
        if (product) {
          this.productComparison.add(product);
        }
      }
    });

    // Add comparison buttons to all product cards
    this.addComparisonButtons();
  }

  /**
   * Initialize Product Reviews
   */
  async initProductReviews() {
    this.productReviews = new ProductReviews();
    this.productReviews.init();
    console.log('✅ Product Reviews initialized');

    // Auto-render reviews for all products
    this.products.forEach(product => {
      const reviewContainer = document.getElementById(`reviews-${product.id}`);
      if (reviewContainer) {
        this.productReviews.renderReviews(product.id, reviewContainer);
      }
    });

    // Add some sample reviews (for demo)
    if (isFeatureEnabled('enableDemoData')) {
      this.addSampleReviews();
    }
  }

  /**
   * Initialize Modern Web Features
   */
  async initModernFeatures() {
    try {
      this.modernFeatures = new ModernWebFeatures();
      console.log('✅ Modern Web Features initialized');

      // Setup Web Vitals tracking
      if (isFeatureEnabled('enableWebVitalsTracking')) {
        this.modernFeatures.setupWebVitals();
      }

      // Add share buttons to product cards
      this.addShareButtons();
    } catch (error) {
      console.warn('[ModernWebFeatures] Failed to initialize:', error.message);
      // Continue without modern features
    }
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Add to cart from wishlist
    window.addToCart = (productId) => {
      const product = this.products.find(p => p.id === productId);
      if (product && window.shoppingCart) {
        window.shoppingCart.addToCart(product);
      }
    };

    // Add all wishlist items to cart
    window.addAllToCart = () => {
      if (!this.wishlist) return;
      
      const items = this.wishlist.getItems();
      items.forEach(item => {
        const product = this.products.find(p => p.id === item.id);
        if (product && window.shoppingCart) {
          window.shoppingCart.addToCart(product);
        }
      });

      if (window.showToast) {
        window.showToast(`✅ Đã thêm ${items.length} sản phẩm vào giỏ hàng`, 'success');
      }
    };

    // Product selected event (from search suggestions)
    document.addEventListener('productSelected', (e) => {
      const { productId } = e.detail;
      console.log('[SuperFeatures] Product selected:', productId);
      
      // Navigate to product detail or open quick view
      this.openProductDetail(productId);
    });
  }

  /**
   * Initialize UI enhancements
   */
  initUIEnhancements() {
    // Add modern CSS utilities
    document.body.classList.add('modern-features-enabled');

    // Setup dark mode toggle (if exists)
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
      });

      // Load saved preference
      if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
      }
    }

    // Setup view transitions (if supported)
    if ('startViewTransition' in document) {
      console.log('✅ View Transitions API supported');
    }

    // Setup container queries (auto-detected by CSS)
    if (CSS.supports('container-type: inline-size')) {
      console.log('✅ Container Queries supported');
    }
  }

  /**
   * Add wishlist buttons to product cards
   */
  addWishlistButtons() {
    document.querySelectorAll('.product-card').forEach(card => {
      const productId = card.dataset.productId;
      if (!productId) return;

      // Check if button already exists
      if (card.querySelector('[data-wishlist-toggle]')) return;

      // Create and add button
      const btn = Wishlist.createButton(productId);
      card.appendChild(btn);
    });
  }

  /**
   * Add comparison buttons to product cards
   */
  addComparisonButtons() {
    document.querySelectorAll('.product-card').forEach(card => {
      const productId = card.dataset.productId;
      if (!productId) return;

      // Check if button already exists
      if (card.querySelector('[data-compare-toggle]')) return;

      // Create and add button
      const btn = ProductComparison.createButton(productId);
      
      // Find actions container or append to card
      const actionsContainer = card.querySelector('.product-actions');
      if (actionsContainer) {
        actionsContainer.appendChild(btn);
      } else {
        card.appendChild(btn);
      }
    });
  }

  /**
   * Add share buttons to product cards
   */
  addShareButtons() {
    if (!this.modernFeatures || !ModernWebFeatures.checkSupport().webShare) {
      return;
    }

    document.querySelectorAll('.product-card').forEach(card => {
      const productId = card.dataset.productId;
      if (!productId) return;

      const product = this.products.find(p => p.id === productId);
      if (!product) return;

      // Create share button
      const btn = document.createElement('button');
      btn.className = 'share-btn px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm';
      btn.innerHTML = '🔗 Chia sẻ';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.modernFeatures.shareProduct(product);
      });

      // Find actions container or append to card
      const actionsContainer = card.querySelector('.product-actions');
      if (actionsContainer) {
        actionsContainer.appendChild(btn);
      }
    });
  }

  /**
   * Add sample reviews for demo
   */
  addSampleReviews() {
    const sampleReviews = [
      {
        productId: 'lap-xuong-gao-lut-001',
        userName: 'Nguyễn Văn A',
        rating: 5,
        title: 'Sản phẩm tuyệt vời!',
        comment: 'Lạp xưởng rất ngon, đóng gói đẹp, giao hàng nhanh. Sẽ ủng hộ tiếp!',
        verified: true
      },
      {
        productId: 'lap-xuong-gao-lut-001',
        userName: 'Trần Thị B',
        rating: 4,
        title: 'Rất hài lòng',
        comment: 'Chất lượng tốt, vị vừa ăn. Chỉ có điểm trừ là hơi nhỏ.',
        verified: true
      },
      {
        productId: 'lap-xuong-truyen-thong-002',
        userName: 'Lê Văn C',
        rating: 5,
        title: 'Ngon như hồi bé!',
        comment: 'Hương vị giống lạp xưởng hồi nhỏ ăn ở quê. Rất thích!',
        verified: false
      }
    ];

    sampleReviews.forEach(review => {
      const { productId, ...reviewData } = review;
      this.productReviews.addReview(productId, reviewData);
    });
  }

  /**
   * Render products (implement your own logic)
   */
  renderProducts(products) {
    const container = document.getElementById('productsContainer') || 
                      document.getElementById('searchResults');
    
    if (!container) {
      console.warn('[SuperFeatures] Products container not found');
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="product-card relative p-4 border rounded-lg hover:shadow-lg transition"
           data-product-id="${product.id}">
        <img src="${product.image}" alt="${product.name}" 
             class="w-full h-48 object-cover rounded-lg mb-4">
        
        <h3 class="text-lg font-semibold mb-2">${product.name}</h3>
        <p class="text-primary text-xl font-bold mb-2">${this.formatPrice(product.price)}</p>
        
        <div class="flex items-center gap-2 mb-4">
          ${this.renderStars(product.rating)}
          <span class="text-sm text-gray-600">(${product.reviews})</span>
        </div>

        <div class="product-actions flex gap-2">
          <button onclick="addToCart('${product.id}')" 
                  class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition">
            🛒 Thêm vào giỏ
          </button>
        </div>

        <!-- Wishlist & Compare buttons will be auto-added -->
      </div>
    `).join('');

    // Re-add buttons after rendering
    this.addWishlistButtons();
    this.addComparisonButtons();
    this.addShareButtons();
  }

  /**
   * Open product detail
   */
  openProductDetail(productId) {
    // Implement your own logic
    console.log('[SuperFeatures] Opening product detail:', productId);
    
    // Example: Navigate to product page
    window.location.hash = `#product-${productId}`;

    // Or: Open modal
    // this.openProductModal(productId);
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
   * Render stars
   */
  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return `
      <div class="flex text-yellow-400">
        ${'★'.repeat(fullStars)}
        ${hasHalfStar ? '✨' : ''}
        ${'☆'.repeat(emptyStars)}
      </div>
    `;
  }

  /**
   * Show welcome notification
   */
  showWelcomeNotification() {
    if (window.showToast) {
      setTimeout(() => {
        window.showToast('🎉 Chào mừng đến với DeltaDev Link!', 'success', {
          duration: 5000
        });
      }, 1000);
    }
  }

  /**
   * Expose globally for easy access
   */
  exposeGlobally() {
    window.superFeatures = this;
    window.voiceSearch = this.voiceSearch;
    window.advancedSearch = this.advancedSearch;
    window.wishlist = this.wishlist;
    window.productComparison = this.productComparison;
    window.productReviews = this.productReviews;
    window.modernFeatures = this.modernFeatures;

    console.log('💡 Super Features available globally:');
    console.log('  - window.superFeatures');
    console.log('  - window.voiceSearch');
    console.log('  - window.advancedSearch');
    console.log('  - window.wishlist');
    console.log('  - window.productComparison');
    console.log('  - window.productReviews');
    console.log('  - window.modernFeatures');
  }
}

// =============================================================================
// 4. AUTO-INITIALIZE
// =============================================================================
// Export class for manual instantiation
export { SuperFeaturesManager };

// Also export as default for convenience
export default SuperFeaturesManager;
