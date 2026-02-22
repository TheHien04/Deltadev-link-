/**
 * Advanced Search & Filter System (2026)
 * Fuzzy search, instant results, smart filters
 * @module AdvancedSearch
 */

export class AdvancedSearch {
  constructor(products = []) {
    this.products = products;
    this.filteredProducts = [...products];
    this.searchHistory = this.loadSearchHistory();
    
    // Search configuration
    this.config = {
      minChars: 2,
      maxResults: 50,
      debounceDelay: 300,
      fuzzyThreshold: 0.6,
      highlightMatches: true
    };

    // Filters state
    this.activeFilters = {
      priceRange: { min: 0, max: Infinity },
      categories: [],
      tags: [],
      inStock: null,
      rating: 0,
      sortBy: 'relevance' // relevance, price-asc, price-desc, name, newest
    };

    // Debounce timer
    this.debounceTimer = null;
  }

  /**
   * Initialize advanced search
   */
  init() {
    this.attachEventListeners();
    console.log('[AdvancedSearch] Initialized with', this.products.length, 'products');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
      searchInput.addEventListener('focus', () => this.showSearchSuggestions());
    }

    // Filter buttons
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFilterClick(e));
    });

    // Sort dropdown
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => this.handleSortChange(e));
    }

    // Clear filters button
    const clearBtn = document.getElementById('clearFilters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearAllFilters());
    }
  }

  /**
   * Handle search input (with debounce)
   */
  handleSearchInput(event) {
    const query = event.target.value.trim();

    // Clear previous timer
    clearTimeout(this.debounceTimer);

    // Show loading indicator
    this.showLoadingIndicator();

    // Debounce search
    this.debounceTimer = setTimeout(() => {
      this.search(query);
    }, this.config.debounceDelay);
  }

  /**
   * Main search function
   */
  search(query) {
    console.log('[AdvancedSearch] Searching for:', query);

    // Hide loading indicator
    this.hideLoadingIndicator();

    // Empty query - show all products
    if (query.length < this.config.minChars) {
      this.filteredProducts = [...this.products];
      this.renderResults();
      this.hideSearchSuggestions();
      return;
    }

    // Perform fuzzy search
    const results = this.fuzzySearch(query);

    // Apply active filters
    this.filteredProducts = this.applyFilters(results);

    // Sort results
    this.sortResults();

    // Render results
    this.renderResults();

    // Show suggestions
    this.showSearchSuggestions(query, results.slice(0, 5));

    // Save to history
    this.saveToHistory(query);

    // Analytics
    if (window.gtag) {
      gtag('event', 'search', {
        search_term: query,
        results_count: this.filteredProducts.length
      });
    }
  }

  /**
   * Fuzzy search algorithm (Levenshtein distance-based)
   */
  fuzzySearch(query) {
    const lowerQuery = query.toLowerCase();
    const results = [];

    this.products.forEach(product => {
      const score = this.calculateRelevanceScore(product, lowerQuery);
      
      if (score > this.config.fuzzyThreshold) {
        results.push({
          ...product,
          _searchScore: score,
          _matchedFields: this.getMatchedFields(product, lowerQuery)
        });
      }
    });

    // Sort by relevance score
    results.sort((a, b) => b._searchScore - a._searchScore);

    return results.slice(0, this.config.maxResults);
  }

  /**
   * Calculate relevance score for a product
   */
  calculateRelevanceScore(product, query) {
    let score = 0;

    // Searchable fields with weights
    const fields = {
      name: 3.0,
      nameEn: 2.5,
      nameVi: 2.5,
      description: 1.5,
      category: 2.0,
      tags: 2.0,
      id: 1.0
    };

    Object.entries(fields).forEach(([field, weight]) => {
      const value = product[field];
      if (!value) return;

      const fieldValue = String(value).toLowerCase();
      
      // Exact match - highest score
      if (fieldValue === query) {
        score += 10 * weight;
      }
      // Starts with query - high score
      else if (fieldValue.startsWith(query)) {
        score += 5 * weight;
      }
      // Contains query - medium score
      else if (fieldValue.includes(query)) {
        score += 3 * weight;
      }
      // Fuzzy match - lower score
      else {
        const similarity = this.calculateSimilarity(fieldValue, query);
        score += similarity * weight;
      }
    });

    return score;
  }

  /**
   * Calculate string similarity (Levenshtein distance)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Levenshtein distance algorithm
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Get matched fields for highlighting
   */
  getMatchedFields(product, query) {
    const matched = [];
    const fields = ['name', 'nameEn', 'nameVi', 'description', 'category'];

    fields.forEach(field => {
      const value = product[field];
      if (value && String(value).toLowerCase().includes(query)) {
        matched.push(field);
      }
    });

    return matched;
  }

  /**
   * Apply active filters
   */
  applyFilters(products) {
    let filtered = [...products];

    // Price range filter
    if (this.activeFilters.priceRange) {
      filtered = filtered.filter(p => 
        p.price >= this.activeFilters.priceRange.min &&
        p.price <= this.activeFilters.priceRange.max
      );
    }

    // Category filter
    if (this.activeFilters.categories.length > 0) {
      filtered = filtered.filter(p =>
        this.activeFilters.categories.includes(p.category)
      );
    }

    // Tags filter
    if (this.activeFilters.tags.length > 0) {
      filtered = filtered.filter(p =>
        p.tags?.some(tag => this.activeFilters.tags.includes(tag))
      );
    }

    // Stock filter
    if (this.activeFilters.inStock !== null) {
      filtered = filtered.filter(p => p.inStock === this.activeFilters.inStock);
    }

    // Rating filter
    if (this.activeFilters.rating > 0) {
      filtered = filtered.filter(p => p.rating >= this.activeFilters.rating);
    }

    return filtered;
  }

  /**
   * Sort results
   */
  sortResults() {
    const sortBy = this.activeFilters.sortBy;

    switch (sortBy) {
      case 'price-asc':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        this.filteredProducts.sort((a, b) => 
          new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        break;
      case 'rating':
        this.filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'relevance':
      default:
        // Already sorted by search score
        break;
    }
  }

  /**
   * Render search results
   */
  renderResults() {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

    // Show results count
    this.updateResultsCount();

    // Dispatch event for other components to handle rendering
    document.dispatchEvent(new CustomEvent('searchResultsUpdated', {
      detail: {
        products: this.filteredProducts,
        count: this.filteredProducts.length
      }
    }));

    console.log('[AdvancedSearch] Rendered', this.filteredProducts.length, 'results');
  }

  /**
   * Update results count display
   */
  updateResultsCount() {
    const countEl = document.getElementById('resultsCount');
    if (countEl) {
      countEl.textContent = `${this.filteredProducts.length} sản phẩm`;
    }
  }

  /**
   * Show search suggestions
   */
  showSearchSuggestions(query = '', results = []) {
    const suggestionsEl = document.getElementById('searchSuggestions');
    if (!suggestionsEl) return;

    // Show search history if empty query
    if (!query) {
      this.renderSearchHistory(suggestionsEl);
      suggestionsEl.style.display = 'block';
      return;
    }

    // Show search results
    if (results.length > 0) {
      suggestionsEl.innerHTML = results.map(product => `
        <div class="suggestion-item p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
             data-product-id="${product.id}">
          <img src="${product.image}" alt="${product.name}" class="w-12 h-12 object-cover rounded">
          <div class="flex-1">
            <div class="font-medium">${this.highlightMatch(product.name, query)}</div>
            <div class="text-sm text-gray-600">${this.formatPrice(product.price)}</div>
          </div>
          <span class="text-xs text-gray-400">${Math.round(product._searchScore * 100)}% match</span>
        </div>
      `).join('');

      suggestionsEl.style.display = 'block';

      // Attach click handlers
      suggestionsEl.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          const productId = item.dataset.productId;
          this.selectProduct(productId);
        });
      });
    } else {
      suggestionsEl.innerHTML = '<div class="p-4 text-center text-gray-500">Không tìm thấy sản phẩm</div>';
      suggestionsEl.style.display = 'block';
    }
  }

  /**
   * Hide search suggestions
   */
  hideSearchSuggestions() {
    const suggestionsEl = document.getElementById('searchSuggestions');
    if (suggestionsEl) {
      setTimeout(() => {
        suggestionsEl.style.display = 'none';
      }, 200);
    }
  }

  /**
   * Render search history
   */
  renderSearchHistory(container) {
    if (this.searchHistory.length === 0) {
      container.innerHTML = '<div class="p-4 text-center text-gray-500">Chưa có tìm kiếm gần đây</div>';
      return;
    }

    container.innerHTML = `
      <div class="p-3 text-xs font-semibold text-gray-500 uppercase">Tìm kiếm gần đây</div>
      ${this.searchHistory.slice(0, 5).map(query => `
        <div class="history-item p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3">
          <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="flex-1">${query}</span>
        </div>
      `).join('')}
    `;

    // Attach click handlers
    container.querySelectorAll('.history-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        const query = this.searchHistory[index];
        document.getElementById('searchInput').value = query;
        this.search(query);
      });
    });
  }

  /**
   * Highlight matched text
   */
  highlightMatch(text, query) {
    if (!this.config.highlightMatches || !query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
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
   * Handle filter click
   */
  handleFilterClick(event) {
    const filterType = event.currentTarget.dataset.filter;
    const filterValue = event.currentTarget.dataset.value;

    console.log('[AdvancedSearch] Filter clicked:', filterType, filterValue);

    // Toggle filter
    this.toggleFilter(filterType, filterValue);

    // Re-render results
    this.search(document.getElementById('searchInput')?.value || '');
  }

  /**
   * Toggle filter
   */
  toggleFilter(type, value) {
    switch (type) {
      case 'category':
        const catIndex = this.activeFilters.categories.indexOf(value);
        if (catIndex > -1) {
          this.activeFilters.categories.splice(catIndex, 1);
        } else {
          this.activeFilters.categories.push(value);
        }
        break;
      case 'tag':
        const tagIndex = this.activeFilters.tags.indexOf(value);
        if (tagIndex > -1) {
          this.activeFilters.tags.splice(tagIndex, 1);
        } else {
          this.activeFilters.tags.push(value);
        }
        break;
      case 'price':
        this.activeFilters.priceRange = JSON.parse(value);
        break;
      case 'inStock':
        this.activeFilters.inStock = value === 'true';
        break;
      case 'rating':
        this.activeFilters.rating = parseInt(value);
        break;
    }

    this.updateFilterUI();
  }

  /**
   * Update filter UI
   */
  updateFilterUI() {
    // Update active filter badges
    const activeFiltersEl = document.getElementById('activeFilters');
    if (!activeFiltersEl) return;

    const badges = [];

    // Category badges
    this.activeFilters.categories.forEach(cat => {
      badges.push(`<span class="filter-badge">${cat}</span>`);
    });

    // Tag badges
    this.activeFilters.tags.forEach(tag => {
      badges.push(`<span class="filter-badge">${tag}</span>`);
    });

    activeFiltersEl.innerHTML = badges.join('');
  }

  /**
   * Clear all filters
   */
  clearAllFilters() {
    this.activeFilters = {
      priceRange: { min: 0, max: Infinity },
      categories: [],
      tags: [],
      inStock: null,
      rating: 0,
      sortBy: 'relevance'
    };

    this.updateFilterUI();
    this.search(document.getElementById('searchInput')?.value || '');
  }

  /**
   * Save search query to history
   */
  saveToHistory(query) {
    if (!query || query.length < this.config.minChars) return;

    // Remove duplicates
    this.searchHistory = this.searchHistory.filter(q => q !== query);

    // Add to beginning
    this.searchHistory.unshift(query);

    // Limit to 10 items
    this.searchHistory = this.searchHistory.slice(0, 10);

    // Save to localStorage
    localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
  }

  /**
   * Load search history from localStorage
   */
  loadSearchHistory() {
    try {
      const history = localStorage.getItem('searchHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('[AdvancedSearch] Failed to load search history:', error);
      return [];
    }
  }

  /**
   * Show/hide loading indicator
   */
  showLoadingIndicator() {
    const indicator = document.getElementById('searchLoading');
    if (indicator) indicator.style.display = 'block';
  }

  hideLoadingIndicator() {
    const indicator = document.getElementById('searchLoading');
    if (indicator) indicator.style.display = 'none';
  }

  /**
   * Select product from suggestions
   */
  selectProduct(productId) {
    document.dispatchEvent(new CustomEvent('productSelected', {
      detail: { productId }
    }));
  }

  /**
   * Update products list
   */
  setProducts(products) {
    this.products = products;
    this.filteredProducts = [...products];
    console.log('[AdvancedSearch] Updated with', products.length, 'products');
  }

  /**
   * Get current results
   */
  getResults() {
    return this.filteredProducts;
  }
}

export default AdvancedSearch;
