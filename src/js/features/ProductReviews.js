/**
 * Product Reviews & Ratings Feature (2026)
 * User-generated content, ratings, helpful votes
 * @module ProductReviews
 */

export class ProductReviews {
  constructor() {
    this.reviews = new Map(); // productId => reviews[]
    this.storageKey = 'productReviews';
    this.userReviews = new Map(); // userId => reviewIds[]
  }

  /**
   * Initialize reviews system
   */
  init() {
    this.load();
    this.attachEventListeners();
    console.log('[ProductReviews] Initialized');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Review form submission
    document.addEventListener('submit', (e) => {
      if (e.target.classList.contains('review-form')) {
        e.preventDefault();
        this.handleReviewSubmit(e.target);
      }
    });

    // Star rating clicks
    document.addEventListener('click', (e) => {
      const star = e.target.closest('[data-rating-star]');
      if (star) {
        this.handleStarClick(star);
      }

      // Helpful vote buttons
      const helpfulBtn = e.target.closest('[data-helpful-review]');
      if (helpfulBtn) {
        this.markHelpful(helpfulBtn.dataset.reviewId, helpfulBtn.dataset.helpful === 'yes');
      }

      // Show all reviews
      const showAllBtn = e.target.closest('[data-show-all-reviews]');
      if (showAllBtn) {
        this.showAllReviews(showAllBtn.dataset.productId);
      }
    });
  }

  /**
   * Add review
   */
  addReview(productId, reviewData) {
    const review = {
      id: this.generateId(),
      productId,
      userId: reviewData.userId || 'guest',
      userName: reviewData.userName || 'Khách hàng',
      userAvatar: reviewData.userAvatar || this.getDefaultAvatar(reviewData.userName),
      rating: reviewData.rating,
      title: reviewData.title || '',
      comment: reviewData.comment,
      images: reviewData.images || [],
      verified: reviewData.verified || false, // Verified purchase
      helpful: 0,
      notHelpful: 0,
      replies: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Add to reviews map
    if (!this.reviews.has(productId)) {
      this.reviews.set(productId, []);
    }
    this.reviews.get(productId).push(review);

    // Sort by date (newest first)
    this.reviews.get(productId).sort((a, b) => b.createdAt - a.createdAt);

    // Save to storage
    this.save();

    // Show notification
    this.showNotification('success', '✅ Cảm ơn bạn đã đánh giá!');

    // Analytics
    if (window.gtag) {
      gtag('event', 'add_review', {
        product_id: productId,
        rating: review.rating
      });
    }

    return review;
  }

  /**
   * Get reviews for a product
   */
  getReviews(productId, options = {}) {
    const {
      limit = null,
      sortBy = 'recent', // recent, helpful, rating-high, rating-low
      minRating = 0
    } = options;

    let reviews = this.reviews.get(productId) || [];

    // Filter by rating
    if (minRating > 0) {
      reviews = reviews.filter(r => r.rating >= minRating);
    }

    // Sort
    reviews = this.sortReviews(reviews, sortBy);

    // Limit
    if (limit) {
      reviews = reviews.slice(0, limit);
    }

    return reviews;
  }

  /**
   * Sort reviews
   */
  sortReviews(reviews, sortBy) {
    const sorted = [...reviews];

    switch (sortBy) {
      case 'helpful':
        sorted.sort((a, b) => b.helpful - a.helpful);
        break;
      case 'rating-high':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-low':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      case 'recent':
      default:
        sorted.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return sorted;
  }

  /**
   * Get average rating for product
   */
  getAverageRating(productId) {
    const reviews = this.reviews.get(productId) || [];
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / reviews.length;
  }

  /**
   * Get rating distribution (5-star breakdown)
   */
  getRatingDistribution(productId) {
    const reviews = this.reviews.get(productId) || [];
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach(review => {
      distribution[review.rating]++;
    });

    return distribution;
  }

  /**
   * Get review count for product
   */
  getReviewCount(productId) {
    return this.reviews.get(productId)?.length || 0;
  }

  /**
   * Handle review form submission
   */
  handleReviewSubmit(form) {
    const formData = new FormData(form);
    const productId = form.dataset.productId;

    // Validate
    if (!productId) {
      this.showNotification('error', 'Lỗi: Không tìm thấy sản phẩm');
      return;
    }

    const rating = parseInt(formData.get('rating'));
    if (!rating || rating < 1 || rating > 5) {
      this.showNotification('error', 'Vui lòng chọn số sao');
      return;
    }

    const comment = formData.get('comment')?.trim();
    if (!comment || comment.length < 10) {
      this.showNotification('error', 'Vui lòng nhập nhận xét (tối thiểu 10 ký tự)');
      return;
    }

    // Create review
    const reviewData = {
      userName: formData.get('userName') || 'Khách hàng',
      rating,
      title: formData.get('title')?.trim() || '',
      comment,
      images: [] // TODO: Handle image upload
    };

    this.addReview(productId, reviewData);

    // Reset form
    form.reset();
    form.querySelector('[data-rating-value]').value = '';

    // Re-render reviews
    this.renderReviews(productId);
  }

  /**
   * Handle star rating click
   */
  handleStarClick(star) {
    const container = star.closest('[data-rating-container]');
    if (!container) return;

    const rating = parseInt(star.dataset.ratingStar);
    const valueInput = container.querySelector('[data-rating-value]');

    if (valueInput) {
      valueInput.value = rating;
    }

    // Update visual state
    this.updateStarVisuals(container, rating);
  }

  /**
   * Update star visuals
   */
  updateStarVisuals(container, rating) {
    const stars = container.querySelectorAll('[data-rating-star]');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add('active', 'text-yellow-400');
        star.classList.remove('text-gray-300');
        star.innerHTML = '★';
      } else {
        star.classList.remove('active', 'text-yellow-400');
        star.classList.add('text-gray-300');
        star.innerHTML = '☆';
      }
    });
  }

  /**
   * Mark review as helpful
   */
  markHelpful(reviewId, isHelpful) {
    // Find review
    let foundReview = null;
    for (const [productId, reviews] of this.reviews) {
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        foundReview = review;
        break;
      }
    }

    if (!foundReview) {
      console.error('[ProductReviews] Review not found:', reviewId);
      return;
    }

    // Check if user already voted
    const voteKey = `review_vote_${reviewId}`;
    const existingVote = localStorage.getItem(voteKey);

    if (existingVote) {
      this.showNotification('info', 'Bạn đã đánh giá review này rồi');
      return;
    }

    // Update vote count
    if (isHelpful) {
      foundReview.helpful++;
    } else {
      foundReview.notHelpful++;
    }

    // Save vote
    localStorage.setItem(voteKey, isHelpful ? 'yes' : 'no');

    // Save to storage
    this.save();

    // Show notification
    this.showNotification('success', 'Cảm ơn phản hồi của bạn!');

    // Re-render
    this.renderReviews(foundReview.productId);
  }

  /**
   * Render reviews for a product
   */
  renderReviews(productId, container = null) {
    if (!container) {
      container = document.getElementById(`reviews-${productId}`);
    }

    if (!container) {
      console.warn('[ProductReviews] Reviews container not found for product:', productId);
      return;
    }

    const reviews = this.getReviews(productId, { limit: 3 });
    const avgRating = this.getAverageRating(productId);
    const totalReviews = this.getReviewCount(productId);
    const distribution = this.getRatingDistribution(productId);

    container.innerHTML = `
      <!-- Rating Summary -->
      <div class="mb-8 p-6 bg-gray-50 rounded-xl">
        <div class="flex items-center gap-8">
          <div class="text-center">
            <div class="text-5xl font-bold text-primary mb-2">${avgRating.toFixed(1)}</div>
            <div class="flex justify-center mb-2">
              ${this.renderStars(avgRating, 20)}
            </div>
            <div class="text-sm text-gray-600">${totalReviews} đánh giá</div>
          </div>

          <div class="flex-1">
            ${[5, 4, 3, 2, 1].map(star => {
              const count = distribution[star];
              const percentage = totalReviews > 0 ? (count / totalReviews * 100).toFixed(0) : 0;
              return `
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-sm w-12">${star} sao</span>
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div class="bg-yellow-400 h-2 rounded-full" style="width: ${percentage}%"></div>
                  </div>
                  <span class="text-sm text-gray-600 w-12 text-right">${count}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Review List -->
      <div class="space-y-6 mb-6">
        ${reviews.length === 0 ? `
          <div class="text-center py-8 text-gray-500">
            <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          </div>
        ` : reviews.map(review => this.renderReviewItem(review)).join('')}
      </div>

      ${totalReviews > 3 ? `
        <button data-show-all-reviews data-product-id="${productId}" 
                class="w-full py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition font-semibold">
          Xem tất cả ${totalReviews} đánh giá
        </button>
      ` : ''}

      <!-- Write Review Button -->
      <button onclick="document.getElementById('reviewForm-${productId}').classList.toggle('hidden')" 
              class="mt-4 w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold">
        ✍️ Viết đánh giá
      </button>

      <!-- Review Form (Initially Hidden) -->
      <div id="reviewForm-${productId}" class="mt-6 p-6 bg-gray-50 rounded-xl hidden">
        ${this.renderReviewForm(productId)}
      </div>
    `;
  }

  /**
   * Render single review item
   */
  renderReviewItem(review) {
    const timeAgo = this.getTimeAgo(review.createdAt);

    return `
      <div class="border rounded-lg p-6 bg-white hover:shadow-md transition">
        <!-- Header -->
        <div class="flex items-start gap-4 mb-4">
          <img src="${review.userAvatar}" alt="${review.userName}" 
               class="w-12 h-12 rounded-full object-cover">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="font-semibold">${review.userName}</h4>
              ${review.verified ? `
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  ✓ Đã mua hàng
                </span>
              ` : ''}
            </div>
            <div class="flex items-center gap-2">
              ${this.renderStars(review.rating)}
              <span class="text-sm text-gray-500">${timeAgo}</span>
            </div>
          </div>
        </div>

        <!-- Title -->
        ${review.title ? `
          <h5 class="font-semibold mb-2">${review.title}</h5>
        ` : ''}

        <!-- Comment -->
        <p class="text-gray-700 mb-4">${review.comment}</p>

        <!-- Images -->
        ${review.images && review.images.length > 0 ? `
          <div class="flex gap-2 mb-4">
            ${review.images.map(img => `
              <img src="${img}" alt="Review image" 
                   class="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition"
                   onclick="window.openLightbox && window.openLightbox('${img}')">
            `).join('')}
          </div>
        ` : ''}

        <!-- Helpful Buttons -->
        <div class="flex items-center gap-4 pt-4 border-t">
          <span class="text-sm text-gray-600">Hữu ích?</span>
          <button data-helpful-review data-review-id="${review.id}" data-helpful="yes"
                  class="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 transition text-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
            </svg>
            <span>${review.helpful}</span>
          </button>
          <button data-helpful-review data-review-id="${review.id}" data-helpful="no"
                  class="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 transition text-sm">
            <svg class="w-4 h-4 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
            </svg>
            <span>${review.notHelpful}</span>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render review form
   */
  renderReviewForm(productId) {
    return `
      <form class="review-form" data-product-id="${productId}">
        <h3 class="text-xl font-bold mb-4">Viết đánh giá của bạn</h3>

        <!-- Name -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Tên của bạn</label>
          <input type="text" name="userName" required
                 class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                 placeholder="Nhập tên của bạn">
        </div>

        <!-- Rating -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Đánh giá</label>
          <div class="flex gap-2" data-rating-container>
            <input type="hidden" name="rating" data-rating-value required>
            ${[1, 2, 3, 4, 5].map(star => `
              <button type="button" data-rating-star="${star}"
                      class="text-3xl text-gray-300 hover:text-yellow-400 transition">
                ☆
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Title -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Tiêu đề (tùy chọn)</label>
          <input type="text" name="title"
                 class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                 placeholder="Tóm tắt đánh giá của bạn">
        </div>

        <!-- Comment -->
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Nhận xét</label>
          <textarea name="comment" rows="4" required
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này (tối thiểu 10 ký tự)"></textarea>
        </div>

        <!-- Submit -->
        <button type="submit"
                class="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold">
          Gửi đánh giá
        </button>
      </form>
    `;
  }

  /**
   * Render star rating
   */
  renderStars(rating, size = 16) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return `
      <div class="flex items-center" style="font-size: ${size}px;">
        ${'★'.repeat(fullStars)}
        ${hasHalfStar ? '✨' : ''}
        ${'☆'.repeat(emptyStars)}
      </div>
    `;
  }

  /**
   * Get time ago string
   */
  getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    const intervals = {
      năm: 31536000,
      tháng: 2592000,
      tuần: 604800,
      ngày: 86400,
      giờ: 3600,
      phút: 60
    };

    for (const [name, secondsInInterval] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInInterval);
      if (interval >= 1) {
        return `${interval} ${name} trước`;
      }
    }

    return 'Vừa xong';
  }

  /**
   * Generate default avatar
   */
  getDefaultAvatar(name) {
    const initial = name.charAt(0).toUpperCase();
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    const color = colors[name.length % colors.length];
    
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <rect fill="${color}" width="100" height="100"/>
        <text fill="white" font-size="50" font-weight="bold" x="50" y="50" text-anchor="middle" dy=".3em">${initial}</text>
      </svg>
    `)}`;
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Show all reviews modal
   */
  showAllReviews(productId) {
    // TODO: Implement modal with all reviews
    console.log('[ProductReviews] Show all reviews for product:', productId);
  }

  /**
   * Show notification
   */
  showNotification(type, message) {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`[ProductReviews] ${type}:`, message);
    }
  }

  /**
   * Save to localStorage
   */
  save() {
    try {
      const data = {};
      for (const [productId, reviews] of this.reviews) {
        data[productId] = reviews;
      }
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log('[ProductReviews] Saved');
    } catch (error) {
      console.error('[ProductReviews] Save failed:', error);
    }
  }

  /**
   * Load from localStorage
   */
  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        for (const [productId, reviews] of Object.entries(parsed)) {
          this.reviews.set(productId, reviews);
        }
        console.log('[ProductReviews] Loaded');
      }
    } catch (error) {
      console.error('[ProductReviews] Load failed:', error);
    }
  }
}

// Export singleton instance
export default new ProductReviews();
