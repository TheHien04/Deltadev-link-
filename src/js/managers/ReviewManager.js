/**
 * Review Manager
 * Handles product reviews and ratings functionality
 * @module managers/ReviewManager
 */

export class ReviewManager {
    constructor(appState, config) {
        this.appState = appState;
        this.config = config;
        this.reviews = {};
        this.modal = null;
        this.currentProductId = null;
        this.currentLanguage = 'vi';
        
        // Translation dictionary
        this.translations = {
            vi: {
                writeReview: 'Viết đánh giá',
                yourRating: 'Đánh giá của bạn',
                yourName: 'Tên của bạn',
                email: 'Email',
                willNotPublish: 'Sẽ không được công khai',
                reviewTitle: 'Tiêu đề',
                yourReview: 'Nội dung đánh giá',
                minimum20Chars: 'Tối thiểu 20 ký tự',
                wouldRecommend: 'Tôi muốn giới thiệu sản phẩm này',
                submitReview: 'Gửi đánh giá',
                cancel: 'Hủy',
                customerReviews: 'Đánh giá của khách hàng',
                noReviewsYet: 'Chưa có đánh giá. Hãy là người đầu tiên!',
                helpful: 'Hữu ích',
                recommend: 'Đề xuất',
                veryBad: '⭐ Rất tệ',
                bad: '⭐⭐ Tệ',
                average: '⭐⭐⭐ Bình thường',
                good: '⭐⭐⭐⭐ Tốt',
                excellent: '⭐⭐⭐⭐⭐ Tuyệt vời!',
                today: 'Hôm nay',
                yesterday: 'Hôm qua',
                daysAgo: 'ngày trước',
                weeksAgo: 'tuần trước',
                monthsAgo: 'tháng trước'
            },
            en: {
                writeReview: 'Write a Review',
                yourRating: 'Your Rating',
                yourName: 'Your Name',
                email: 'Email',
                willNotPublish: 'Will not be published',
                reviewTitle: 'Review Title',
                yourReview: 'Your Review',
                minimum20Chars: 'Minimum 20 characters',
                wouldRecommend: 'I would recommend this product',
                submitReview: 'Submit Review',
                cancel: 'Cancel',
                customerReviews: 'Customer Reviews',
                noReviewsYet: 'No reviews yet. Be the first!',
                helpful: 'Helpful',
                recommend: 'Recommend',
                veryBad: '⭐ Very Bad',
                bad: '⭐⭐ Bad',
                average: '⭐⭐⭐ Average',
                good: '⭐⭐⭐⭐ Good',
                excellent: '⭐⭐⭐⭐⭐ Excellent!',
                today: 'Today',
                yesterday: 'Yesterday',
                daysAgo: 'days ago',
                weeksAgo: 'weeks ago',
                monthsAgo: 'months ago',
                namePlaceholder: 'John Doe',
                emailPlaceholder: 'email@example.com',
                titlePlaceholder: 'Summarize your review',
                reviewPlaceholder: 'Share your experience with this product...'
            }
        };
    }

    /**
     * Initialize review manager
     */
    init() {
        console.log('[ReviewManager] Initializing...');
        
        this.currentLanguage = this.appState.get('currentLanguage') || 'vi';
        this.loadReviews();
        this.createReviewModal();
        this.attachEventListeners();
        this.addReviewButtonsToProducts();
        
        // Listen for language changes
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            this.updateLanguage();
        });
        
        console.log('[ReviewManager] Initialized with', Object.keys(this.reviews).length, 'products reviewed');
    }

    /**
     * Load reviews from localStorage
     */
    loadReviews() {
        try {
            const saved = localStorage.getItem('productReviews');
            this.reviews = saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('[ReviewManager] Failed to load reviews:', error);
            this.reviews = {};
        }
    }

    /**
     * Save reviews to localStorage
     */
    saveReviews() {
        try {
            localStorage.setItem('productReviews', JSON.stringify(this.reviews));
        } catch (error) {
            console.error('[ReviewManager] Failed to save reviews:', error);
        }
    }

    /**
     * Create review modal
     */
    createReviewModal() {
        const modal = document.createElement('div');
        modal.id = 'reviewModal';
        modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm hidden z-[100] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                <!-- Close Button -->
                <button id="closeReviewModal" class="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition z-10">
                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>

                <!-- Review Form -->
                <div class="p-6 md:p-8">
                    <h2 class="text-3xl font-bold mb-6 flex items-center gap-2">
                        <svg class="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span data-en="Write a Review" data-vi="Viết đánh giá">Viết đánh giá</span>
                    </h2>
                    
                    <form id="reviewForm" class="space-y-6">
                        <!-- Product Info -->
                        <div id="reviewProductInfo" class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <!-- Injected dynamically -->
                        </div>
                        
                        <!-- Rating -->
                        <div>
                            <label class="block text-sm font-semibold mb-3" data-en="Your Rating" data-vi="Đánh giá của bạn">Đánh giá của bạn *</label>
                            <div class="flex gap-2" id="ratingStars">
                                ${[1, 2, 3, 4, 5].map(i => `
                                    <button type="button" class="rating-star w-12 h-12 hover:scale-110 transition" data-rating="${i}">
                                        <svg class="w-full h-full text-gray-300 hover:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                        </svg>
                                    </button>
                                `).join('')}
                            </div>
                            <input type="hidden" id="ratingValue" name="rating" required>
                            <p class="text-sm text-gray-500 mt-2" id="ratingText"></p>
                        </div>
                        
                        <!-- Name -->
                        <div>
                            <label for="reviewerName" class="block text-sm font-semibold mb-2" data-en="Your Name" data-vi="Tên của bạn">Tên của bạn *</label>
                            <input type="text" id="reviewerName" name="name" required 
                                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                                   placeholder="Nguyễn Văn A">
                        </div>
                        
                        <!-- Email -->
                        <div>
                            <label for="reviewerEmail" class="block text-sm font-semibold mb-2" data-en="Email" data-vi="Email">Email *</label>
                            <input type="email" id="reviewerEmail" name="email" required 
                                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                                   placeholder="email@example.com">
                            <p class="text-xs text-gray-500 mt-1" data-en="Will not be published" data-vi="Sẽ không được công khai">Sẽ không được công khai</p>
                        </div>
                        
                        <!-- Review Title -->
                        <div>
                            <label for="reviewTitle" class="block text-sm font-semibold mb-2" data-en="Review Title" data-vi="Tiêu đề">Tiêu đề *</label>
                            <input type="text" id="reviewTitle" name="title" required 
                                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                                   placeholder="Tóm tắt đánh giá của bạn">
                        </div>
                        
                        <!-- Review Text -->
                        <div>
                            <label for="reviewText" class="block text-sm font-semibold mb-2" data-en="Your Review" data-vi="Nội dung đánh giá">Nội dung đánh giá *</label>
                            <textarea id="reviewText" name="review" rows="5" required 
                                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition resize-none"
                                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."></textarea>
                            <p class="text-xs text-gray-500 mt-1" data-en="Minimum 20 characters" data-vi="Tối thiểu 20 ký tự">Tối thiểu 20 ký tự</p>
                        </div>
                        
                        <!-- Would Recommend -->
                        <div class="flex items-center gap-3">
                            <input type="checkbox" id="wouldRecommend" name="recommend" 
                                   class="w-5 h-5 text-primary border-2 border-gray-200 rounded focus:ring-2 focus:ring-primary">
                            <label for="wouldRecommend" class="text-sm font-medium" data-en="I would recommend this product" data-vi="Tôi muốn giới thiệu sản phẩm này">Tôi muốn giới thiệu sản phẩm này</label>
                        </div>
                        
                        <!-- Submit Button -->
                        <div class="flex gap-3">
                            <button type="submit" id="submitReview"
                                    class="flex-1 py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-semibold text-lg">
                                <span data-en="Submit Review" data-vi="Gửi đánh giá">Gửi đánh giá</span>
                            </button>
                            <button type="button" id="cancelReview"
                                    class="px-6 py-4 border-2 border-gray-300 rounded-xl hover:border-gray-400 transition">
                                <span data-en="Cancel" data-vi="Hủy">Hủy</span>
                            </button>
                        </div>
                    </form>
                    
                    <!-- Reviews List -->
                    <div id="existingReviews" class="mt-8 pt-8 border-t border-gray-200">
                        <h3 class="text-2xl font-bold mb-6" data-en="Customer Reviews" data-vi="Đánh giá của khách hàng">Đánh giá của khách hàng</h3>
                        <div id="reviewsList">
                            <!-- Reviews will be injected here -->
                        </div>
                    </div>
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
        document.getElementById('closeReviewModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cancelReview')?.addEventListener('click', () => this.closeModal());
        
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal?.classList.contains('hidden')) {
                this.closeModal();
            }
        });
        
        // Rating stars
        document.querySelectorAll('.rating-star').forEach(star => {
            star.addEventListener('click', (e) => {
                e.preventDefault();
                const rating = parseInt(star.dataset.rating);
                this.setRating(rating);
            });
        });
        
        // Review form submission
        document.getElementById('reviewForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReview();
        });
    }

    /**
     * Add review buttons to product cards
     */
    addReviewButtonsToProducts() {
        const productCards = document.querySelectorAll('.product-card:not(.coming-soon)');
        
        productCards.forEach(card => {
            const button = card.querySelector('.add-to-cart');
            if (!button) return;
            
            const productId = button.dataset.productId;
            const productInfo = card.querySelector('.product-info');
            
            // Check if review button already exists
            if (card.querySelector('.write-review-btn')) return;
            
            // Create review button
            const reviewBtn = document.createElement('button');
            reviewBtn.className = 'write-review-btn mt-3 w-full py-2 text-sm text-gray-600 hover:text-primary transition flex items-center justify-center gap-2 border border-gray-200 rounded-lg hover:border-primary';
            reviewBtn.innerHTML = `
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
                <span data-en="Write Review" data-vi="Viết đánh giá">Viết đánh giá</span>
            `;
            
            reviewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openReviewModal({
                    id: button.dataset.productId,
                    name: button.dataset.productName,
                    price: parseInt(button.dataset.productPrice),
                    image: button.dataset.productImage
                });
            });
            
            productInfo?.appendChild(reviewBtn);
        });
    }

    /**
     * Set rating
     */
    setRating(rating) {
        document.getElementById('ratingValue').value = rating;
        
        const stars = document.querySelectorAll('.rating-star svg');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('text-gray-300');
                star.classList.add('text-yellow-400');
            } else {
                star.classList.remove('text-yellow-400');
                star.classList.add('text-gray-300');
            }
        });
        
        const ratingTexts = {
            1: this.t('veryBad'),
            2: this.t('bad'),
            3: this.t('average'),
            4: this.t('good'),
            5: this.t('excellent')
        };
        
        const ratingText = document.getElementById('ratingText');
        if (ratingText) {
            ratingText.textContent = ratingTexts[rating];
            ratingText.className = 'text-sm font-semibold mt-2 ' + (rating >= 4 ? 'text-green-600' : rating >= 3 ? 'text-yellow-600' : 'text-red-600');
        }
    }

    /**
     * Open review modal
     */
    openReviewModal(product) {
        this.currentProductId = product.id;
        
        // Populate product info
        const productInfoDiv = document.getElementById('reviewProductInfo');
        if (productInfoDiv) {
            productInfoDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="w-16 h-16 object-cover rounded-lg">
                <div>
                    <h4 class="font-semibold">${product.name}</h4>
                    <p class="text-primary font-bold">${this.formatPrice(product.price)}</p>
                </div>
            `;
        }
        
        // Reset form
        document.getElementById('reviewForm')?.reset();
        this.setRating(5); // Default to 5 stars
        
        // Load existing reviews
        this.renderReviews(product.id);
        
        // Show modal
        this.modal?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Submit review
     */
    submitReview() {
        const form = document.getElementById('reviewForm');
        if (!form) return;
        
        const formData = new FormData(form);
        const rating = parseInt(formData.get('rating'));
        const name = formData.get('name');
        const email = formData.get('email');
        const title = formData.get('title');
        const review = formData.get('review');
        const recommend = formData.get('recommend') === 'on';
        
        // Validation
        if (!rating || rating < 1 || rating > 5) {
            this.showNotification('error', 'Vui lòng chọn số sao đánh giá');
            return;
        }
        
        if (!name || name.trim().length < 2) {
            this.showNotification('error', 'Vui lòng nhập tên của bạn');
            return;
        }
        
        if (!email || !email.includes('@')) {
            this.showNotification('error', 'Vui lòng nhập email hợp lệ');
            return;
        }
        
        if (!title || title.trim().length < 5) {
            this.showNotification('error', 'Tiêu đề phải có ít nhất 5 ký tự');
            return;
        }
        
        if (!review || review.trim().length < 20) {
            this.showNotification('error', 'Nội dung đánh giá phải có ít nhất 20 ký tự');
            return;
        }
        
        // Create review object
        const reviewObj = {
            id: Date.now(),
            productId: this.currentProductId,
            rating,
            name: name.trim(),
            email: email.trim(),
            title: title.trim(),
            review: review.trim(),
            recommend,
            date: new Date().toISOString(),
            helpful: 0
        };
        
        // Add to reviews
        if (!this.reviews[this.currentProductId]) {
            this.reviews[this.currentProductId] = [];
        }
        this.reviews[this.currentProductId].unshift(reviewObj);
        
        // Save to localStorage
        this.saveReviews();
        
        // Show success message
        this.showNotification('success', '✅ Cảm ơn bạn đã đánh giá!');
        
        // Refresh reviews list
        this.renderReviews(this.currentProductId);
        
        // Reset form
        form.reset();
        this.setRating(5);
        
        // Scroll to reviews list
        document.getElementById('existingReviews')?.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Render reviews for a product
     */
    renderReviews(productId) {
        const reviewsList = document.getElementById('reviewsList');
        if (!reviewsList) return;
        
        const productReviews = this.reviews[productId] || [];
        
        if (productReviews.length === 0) {
            reviewsList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p data-en="No reviews yet. Be the first!" data-vi="Chưa có đánh giá. Hãy là người đầu tiên!">Chưa có đánh giá. Hãy là người đầu tiên!</p>
                </div>
            `;
            return;
        }
        
        // Calculate average rating
        const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        
        reviewsList.innerHTML = `
            <div class="mb-6 p-4 bg-gray-50 rounded-xl">
                <div class="flex items-center gap-4">
                    <div class="text-center">
                        <div class="text-4xl font-bold text-primary">${avgRating.toFixed(1)}</div>
                        <div class="flex gap-1 mt-1">
                            ${this.renderStars(avgRating)}
                        </div>
                        <p class="text-sm text-gray-500 mt-1">${productReviews.length} ${this.currentLanguage === 'vi' ? 'đánh giá' : 'reviews'}</p>
                    </div>
                    <div class="flex-1">
                        ${[5, 4, 3, 2, 1].map(star => {
                            const count = productReviews.filter(r => r.rating === star).length;
                            const percentage = (count / productReviews.length * 100).toFixed(0);
                            return `
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-sm w-8">${star}⭐</span>
                                    <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div class="h-full bg-yellow-400" style="width: ${percentage}%"></div>
                                    </div>
                                    <span class="text-sm text-gray-500 w-12">${count}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            
            <div class="space-y-4">
                ${productReviews.map(review => `
                    <div class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                        <div class="flex items-start justify-between mb-3">
                            <div>
                                <div class="flex gap-1 mb-1">
                                    ${this.renderStars(review.rating)}
                                </div>
                                <h4 class="font-semibold">${review.title}</h4>
                            </div>
                            <span class="text-sm text-gray-500">${this.formatDate(review.date)}</span>
                        </div>
                        <p class="text-gray-700 mb-3">${review.review}</p>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-medium text-gray-700">${review.name}</span>
                                ${review.recommend ? `<span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ ${this.t('recommend')}</span>` : ''}
                            </div>
                            <button class="text-sm text-gray-500 hover:text-primary transition flex items-center gap-1">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
                                </svg>
                                ${this.t('helpful')} (${review.helpful})
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Close modal
     */
    closeModal() {
        this.modal?.classList.add('hidden');
        document.body.style.overflow = '';
        this.currentProductId = null;
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
     * Format date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return this.t('today');
        if (diffDays === 1) return this.t('yesterday');
        if (diffDays < 7) return `${diffDays} ${this.t('daysAgo')}`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${this.t('weeksAgo')}`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} ${this.t('monthsAgo')}`;
        
        const locale = this.currentLanguage === 'vi' ? 'vi-VN' : 'en-US';
        return date.toLocaleDateString(locale);
    }

    /**
     * Update language for all dynamic content
     */
    updateLanguage() {
        // Update form placeholders
        const nameInput = document.getElementById('reviewerName');
        const emailInput = document.getElementById('reviewerEmail');
        const titleInput = document.getElementById('reviewTitle');
        const reviewTextarea = document.getElementById('reviewText');
        
        if (nameInput) nameInput.placeholder = this.t('namePlaceholder');
        if (emailInput) emailInput.placeholder = this.t('emailPlaceholder');
        if (titleInput) titleInput.placeholder = this.t('titlePlaceholder');
        if (reviewTextarea) reviewTextarea.placeholder = this.t('reviewPlaceholder');
        
        // Update modal if open
        if (this.modal && !this.modal.classList.contains('hidden')) {
            const productId = this.currentProductId;
            if (productId) {
                this.renderReviews(productId);
            }
        }
        
        // Update review buttons on products
        document.querySelectorAll('.write-review-btn span').forEach(span => {
            if (span.hasAttribute('data-en') || span.hasAttribute('data-vi')) {
                // Already handled by LanguageManager
            } else {
                span.textContent = this.translations[this.currentLanguage].writeReview;
            }
        });
    }
    
    /**
     * Get translation
     */
    t(key) {
        return this.translations[this.currentLanguage][key] || key;
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

export default ReviewManager;
