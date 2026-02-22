/**
 * Product Search & Filter Manager
 * Handles product search, filtering, and sorting
 * @module managers/ProductSearchManager
 */

export class ProductSearchManager {
    constructor(appState, config) {
        this.appState = appState;
        this.config = config;
        this.products = [];
        this.filteredProducts = [];
        this.searchInput = null;
        this.searchResults = null;
        this.categoryFilter = null;
        this.sortFilter = null;
        this.resultsCount = null;
        this.priceFilterBtn = null;
        this.priceFilterDropdown = null;
        this.minPriceInput = null;
        this.maxPriceInput = null;
        this.priceRange = null;
        this.minPrice = 50000;
        this.maxPrice = 500000;
    }

    /**
     * Initialize search manager
     */
    init() {
        console.log('[ProductSearchManager] Initializing...');
        
        // Get DOM elements
        this.searchInput = document.getElementById('productSearch');
        this.searchResults = document.getElementById('searchResults');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.sortFilter = document.getElementById('sortFilter');
        this.resultsCount = document.getElementById('resultsCount');
        this.priceFilterBtn = document.getElementById('priceFilterBtn');
        this.priceFilterDropdown = document.getElementById('priceFilterDropdown');
        this.minPriceInput = document.getElementById('minPrice');
        this.maxPriceInput = document.getElementById('maxPrice');
        this.priceRange = document.getElementById('priceRange');
        
        if (!this.searchInput) {
            console.warn('[ProductSearchManager] Search elements not found');
            return;
        }
        
        // Extract products from DOM
        this.extractProducts();
        
        // Attach event listeners
        this.attachEventListeners();
        
        console.log('[ProductSearchManager] Initialized successfully with', this.products.length, 'products');
    }

    /**
     * Extract product data from product cards
     */
    extractProducts() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const button = card.querySelector('.add-to-cart');
            const titleEl = card.querySelector('.product-info h3');
            const descEl = card.querySelector('.product-info p');
            const priceEl = card.querySelector('.product-info .text-primary');
            const badgeEl = card.querySelector('.badge, [class*="bg-"]');
            const imgEl = card.querySelector('img');
            
            if (button && titleEl) {
                const product = {
                    id: button.dataset.productId,
                    name: button.dataset.productName,
                    nameEn: titleEl.getAttribute('data-en') || titleEl.textContent.trim(),
                    nameVi: titleEl.getAttribute('data-vi') || titleEl.textContent.trim(),
                    description: descEl ? descEl.textContent.trim() : '',
                    price: parseInt(button.dataset.productPrice),
                    image: button.dataset.productImage,
                    badge: badgeEl ? badgeEl.textContent.trim() : '',
                    element: card
                };
                
                this.products.push(product);
            }
        });
        
        this.filteredProducts = [...this.products];
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Search input
        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 0) {
                this.search(query);
            } else {
                this.hideSearchResults();
                this.showAllProducts();
            }
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box')) {
                this.hideSearchResults();
            }
        });
        
        // Category filter
        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
        // Sort filter
        if (this.sortFilter) {
            this.sortFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
        // Price filter toggle
        if (this.priceFilterBtn) {
            this.priceFilterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.priceFilterDropdown.classList.toggle('hidden');
            });
        }
        
        // Price range slider
        if (this.priceRange) {
            this.priceRange.addEventListener('input', (e) => {
                this.maxPriceInput.value = e.target.value;
            });
        }
        
        // Price inputs
        if (this.minPriceInput) {
            this.minPriceInput.addEventListener('change', (e) => {
                this.minPrice = parseInt(e.target.value) || 50000;
            });
        }
        
        if (this.maxPriceInput) {
            this.maxPriceInput.addEventListener('change', (e) => {
                this.maxPrice = parseInt(e.target.value) || 500000;
                if (this.priceRange) {
                    this.priceRange.value = this.maxPrice;
                }
            });
        }
        
        // Apply price filter button
        document.getElementById('applyPriceFilter')?.addEventListener('click', () => {
            this.minPrice = parseInt(this.minPriceInput.value) || 50000;
            this.maxPrice = parseInt(this.maxPriceInput.value) || 500000;
            this.applyFilters();
            this.priceFilterDropdown.classList.add('hidden');
        });
        
        // Clear price filter button
        document.getElementById('clearPriceFilter')?.addEventListener('click', () => {
            this.minPrice = 50000;
            this.maxPrice = 500000;
            if (this.minPriceInput) this.minPriceInput.value = 50000;
            if (this.maxPriceInput) this.maxPriceInput.value = 500000;
            if (this.priceRange) this.priceRange.value = 500000;
            this.applyFilters();
        });
        
        // Close price filter dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.priceFilterDropdown && !e.target.closest('#priceFilterBtn') && !e.target.closest('#priceFilterDropdown')) {
                this.priceFilterDropdown.classList.add('hidden');
            }
        });
    }

    /**
     * Search products
     */
    search(query) {
        const lowerQuery = query.toLowerCase();
        const results = this.products.filter(product => {
            return product.nameEn.toLowerCase().includes(lowerQuery) ||
                   product.nameVi.toLowerCase().includes(lowerQuery) ||
                   product.description.toLowerCase().includes(lowerQuery) ||
                   product.badge.toLowerCase().includes(lowerQuery);
        });
        
        this.showSearchResults(results, query);
        this.filterProductsBySearch(results);
    }

    /**
     * Show search results dropdown
     */
    showSearchResults(results, query) {
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p data-en="No products found" data-vi="Không tìm thấy sản phẩm">Không tìm thấy sản phẩm</p>
                    <p class="text-sm mt-1" data-en='Try different keywords' data-vi='Thử từ khóa khác'>Thử từ khóa khác</p>
                </div>
            `;
        } else {
            this.searchResults.innerHTML = results.slice(0, 5).map(product => `
                <div class="search-result-item flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors" data-product-id="${product.id}">
                    <img src="${product.image}" alt="${product.name}" class="w-12 h-12 object-cover rounded-lg">
                    <div class="flex-1">
                        <p class="font-semibold text-gray-800">${this.highlightQuery(product.name, query)}</p>
                        <p class="text-sm text-gray-500">${this.formatPrice(product.price)}</p>
                    </div>
                    ${product.badge ? `<span class="text-xs px-2 py-1 bg-primary/10 text-primary rounded">${product.badge}</span>` : ''}
                </div>
            `).join('');
            
            // Add click handlers
            this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const productId = item.dataset.productId;
                    this.scrollToProduct(productId);
                    this.hideSearchResults();
                    this.searchInput.value = '';
                });
            });
        }
        
        this.searchResults.classList.remove('hidden');
    }

    /**
     * Hide search results dropdown
     */
    hideSearchResults() {
        if (this.searchResults) {
            this.searchResults.classList.add('hidden');
        }
    }

    /**
     * Filter products by search results
     */
    filterProductsBySearch(results) {
        this.filteredProducts = results;
        this.updateProductDisplay();
    }

    /**
     * Apply filters (category + sort + price)
     */
    applyFilters() {
        const category = this.categoryFilter ? this.categoryFilter.value : 'all';
        const sort = this.sortFilter ? this.sortFilter.value : 'default';
        
        // Filter by category and price
        let filtered = [...this.products];
        
        // Apply price filter
        filtered = filtered.filter(product => {
            return product.price >= this.minPrice && product.price <= this.maxPrice;
        });
        
        // Apply category filter
        if (category !== 'all') {
            filtered = filtered.filter(product => {
                const badge = product.badge.toLowerCase();
                const name = product.nameEn.toLowerCase();
                
                switch(category) {
                    case 'bestseller':
                        return badge.includes('best') || badge.includes('popular');
                    case 'new':
                        return badge.includes('new');
                    case 'premium':
                        return badge.includes('premium') || name.includes('premium');
                    case 'organic':
                        return badge.includes('organic') || name.includes('organic');
                    case 'gift':
                        return badge.includes('gift') || name.includes('box') || name.includes('pack');
                    default:
                        return true;
                }
            });
        }
        
        // Sort products
        if (sort !== 'default') {
            filtered.sort((a, b) => {
                switch(sort) {
                    case 'price-asc':
                        return a.price - b.price;
                    case 'price-desc':
                        return b.price - a.price;
                    case 'name-asc':
                        return a.name.localeCompare(b.name);
                    case 'name-desc':
                        return b.name.localeCompare(a.name);
                    default:
                        return 0;
                }
            });
        }
        
        this.filteredProducts = filtered;
        this.updateProductDisplay();
    }

    /**
     * Update product display
     */
    updateProductDisplay() {
        // Hide all products
        this.products.forEach(product => {
            product.element.style.display = 'none';
        });
        
        // Show filtered products
        this.filteredProducts.forEach(product => {
            product.element.style.display = 'block';
        });
        
        // Update results count
        if (this.resultsCount) {
            const count = this.filteredProducts.length;
            const lang = document.documentElement.lang || 'vi';
            const text = lang === 'en' ? `${count} products` : `${count} sản phẩm`;
            this.resultsCount.querySelector('span').textContent = text;
        }
        
        // Show "no results" message if needed
        const productsGrid = document.querySelector('.products-grid');
        const noResultsMessage = document.getElementById('noResultsMessage');
        
        if (this.filteredProducts.length === 0) {
            if (!noResultsMessage) {
                const message = document.createElement('div');
                message.id = 'noResultsMessage';
                message.className = 'col-span-full text-center py-12';
                message.innerHTML = `
                    <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                    <p class="text-xl font-semibold text-gray-600 mb-2" data-en="No products found" data-vi="Không tìm thấy sản phẩm">Không tìm thấy sản phẩm</p>
                    <p class="text-gray-500" data-en="Try adjusting your filters" data-vi="Thử điều chỉnh bộ lọc">Thử điều chỉnh bộ lọc</p>
                `;
                productsGrid.appendChild(message);
            }
        } else {
            if (noResultsMessage) {
                noResultsMessage.remove();
            }
        }
    }

    /**
     * Show all products
     */
    showAllProducts() {
        this.filteredProducts = [...this.products];
        this.updateProductDisplay();
        
        // Reset filters
        if (this.categoryFilter) this.categoryFilter.value = 'all';
        if (this.sortFilter) this.sortFilter.value = 'default';
    }

    /**
     * Scroll to product
     */
    scrollToProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product && product.element) {
            product.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Highlight effect
            product.element.style.animation = 'pulse 1s ease-in-out 2';
            setTimeout(() => {
                product.element.style.animation = '';
            }, 2000);
        }
    }

    /**
     * Highlight search query in text
     */
    highlightQuery(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200 px-1">$1</mark>');
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
}

export default ProductSearchManager;
