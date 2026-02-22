/**
 * Newsletter Manager
 * Handles email newsletter subscriptions
 * @module managers/NewsletterManager
 */

export class NewsletterManager {
    constructor(appState, config) {
        this.appState = appState;
        this.config = config;
        this.currentLanguage = 'vi';
        this.subscribers = [];
        this.popupShown = false;
        
        // Translations
        this.translations = {
            vi: {
                subscribe: 'Đăng ký nhận tin',
                emailPlaceholder: 'Nhập email của bạn',
                subscribeButton: 'Đăng ký',
                subscribeTitle: 'Nhận ưu đãi đặc biệt!',
                subscribeDesc: 'Đăng ký nhận tin để được giảm giá 10% cho đơn hàng đầu tiên và cập nhật sản phẩm mới nhất',
                discount10: 'Giảm 10% đơn đầu',
                newProducts: 'Sản phẩm mới',
                exclusiveOffers: 'Ưu đãi độc quyền',
                noSpam: 'Không spam, chỉ tin tức hữu ích',
                thankYou: 'Cảm ơn bạn đã đăng ký!',
                checkEmail: 'Vui lòng kiểm tra email để nhận mã giảm giá',
                invalidEmail: 'Email không hợp lệ',
                alreadySubscribed: 'Email này đã đăng ký',
                close: 'Đóng'
            },
            en: {
                subscribe: 'Subscribe to Newsletter',
                emailPlaceholder: 'Enter your email',
                subscribeButton: 'Subscribe',
                subscribeTitle: 'Get Special Offers!',
                subscribeDesc: 'Subscribe to get 10% off your first order and stay updated with our latest products',
                discount10: '10% Off First Order',
                newProducts: 'New Products',
                exclusiveOffers: 'Exclusive Offers',
                noSpam: 'No spam, only useful updates',
                thankYou: 'Thank you for subscribing!',
                checkEmail: 'Please check your email for discount code',
                invalidEmail: 'Invalid email',
                alreadySubscribed: 'Email already subscribed',
                close: 'Close'
            }
        };
    }

    /**
     * Initialize newsletter manager
     */
    init() {
        console.log('[NewsletterManager] Initializing...');
        
        // Load language
        this.currentLanguage = this.appState.get('currentLanguage') || 'vi';
        
        // Listen for language changes
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            this.updateLanguage();
        });
        
        // Load subscribers
        this.loadSubscribers();
        
        // Add newsletter form to footer
        this.addFooterNewsletter();
        
        // Create popup modal
        this.createNewsletterPopup();
        
        // Show popup after delay (if not subscribed)
        this.schedulePopup();
        
        console.log('[NewsletterManager] Initialized');
    }

    /**
     * Load subscribers from localStorage
     */
    loadSubscribers() {
        try {
            const stored = localStorage.getItem('newsletterSubscribers');
            this.subscribers = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('[NewsletterManager] Failed to load subscribers:', error);
        }
    }

    /**
     * Save subscribers
     */
    saveSubscribers() {
        try {
            localStorage.setItem('newsletterSubscribers', JSON.stringify(this.subscribers));
        } catch (error) {
            console.error('[NewsletterManager] Failed to save subscribers:', error);
        }
    }

    /**
     * Add newsletter form to footer
     */
    addFooterNewsletter() {
        const footer = document.querySelector('footer .container');
        if (!footer) return;
        
        const newsletterSection = document.createElement('div');
        newsletterSection.className = 'newsletter-footer mt-12 pt-8 border-t border-gray-700';
        newsletterSection.innerHTML = `
            <div class="max-w-xl mx-auto text-center">
                <h3 class="text-2xl font-bold text-white mb-3" id="footerNewsletterTitle"></h3>
                <p class="text-gray-300 mb-6" id="footerNewsletterDesc"></p>
                <form id="footerNewsletterForm" class="flex flex-col sm:flex-row gap-3">
                    <input type="email" 
                           id="footerNewsletterEmail" 
                           required
                           class="flex-1 px-6 py-3 rounded-lg border-2 border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-primary focus:outline-none transition">
                    <button type="submit" class="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold whitespace-nowrap">
                        <span id="footerSubscribeBtn"></span>
                    </button>
                </form>
                <p class="text-xs text-gray-400 mt-3" id="footerNoSpam"></p>
            </div>
        `;
        
        footer.appendChild(newsletterSection);
        
        // Update text
        this.updateFooterText();
        
        // Event listener
        document.getElementById('footerNewsletterForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('footerNewsletterEmail').value;
            this.subscribe(email);
        });
    }

    /**
     * Update footer text
     */
    updateFooterText() {
        const title = document.getElementById('footerNewsletterTitle');
        const desc = document.getElementById('footerNewsletterDesc');
        const btn = document.getElementById('footerSubscribeBtn');
        const noSpam = document.getElementById('footerNoSpam');
        const input = document.getElementById('footerNewsletterEmail');
        
        if (title) title.textContent = this.t('subscribeTitle');
        if (desc) desc.textContent = this.t('subscribeDesc');
        if (btn) btn.textContent = this.t('subscribeButton');
        if (noSpam) noSpam.textContent = this.t('noSpam');
        if (input) input.placeholder = this.t('emailPlaceholder');
    }

    /**
     * Create newsletter popup
     */
    createNewsletterPopup() {
        const popup = document.createElement('div');
        popup.id = 'newsletterPopup';
        popup.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm hidden z-[100] flex items-center justify-center p-4';
        popup.innerHTML = `
            <div class="bg-white rounded-3xl max-w-md w-full relative overflow-hidden">
                <button id="closeNewsletterPopup" class="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition z-10">
                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>

                <!-- Header Image -->
                <div class="bg-gradient-to-br from-primary to-orange-500 p-8 text-white text-center">
                    <div class="text-6xl mb-3">📧</div>
                    <h2 class="text-2xl font-bold mb-2" id="popupNewsletterTitle"></h2>
                    <p class="text-white/90" id="popupNewsletterDesc"></p>
                </div>

                <!-- Content -->
                <div class="p-8">
                    <!-- Benefits -->
                    <div class="grid grid-cols-3 gap-3 mb-6">
                        <div class="text-center">
                            <div class="text-3xl mb-2">🎁</div>
                            <p class="text-xs font-semibold text-gray-700" id="popup10Off"></p>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl mb-2">✨</div>
                            <p class="text-xs font-semibold text-gray-700" id="popupNewProducts"></p>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl mb-2">💎</div>
                            <p class="text-xs font-semibold text-gray-700" id="popupExclusive"></p>
                        </div>
                    </div>

                    <!-- Form -->
                    <form id="popupNewsletterForm">
                        <input type="email" 
                               id="popupNewsletterEmail" 
                               required
                               class="w-full px-6 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition mb-4">
                        <button type="submit" class="w-full py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold text-lg">
                            <span id="popupSubscribeBtn"></span>
                        </button>
                    </form>

                    <p class="text-xs text-gray-500 text-center mt-4" id="popupNoSpam"></p>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        this.popup = popup;
        
        // Update text
        this.updatePopupText();
        
        // Event listeners
        document.getElementById('closeNewsletterPopup')?.addEventListener('click', () => this.hidePopup());
        popup.addEventListener('click', (e) => {
            if (e.target === popup) this.hidePopup();
        });
        
        document.getElementById('popupNewsletterForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('popupNewsletterEmail').value;
            this.subscribe(email);
        });
    }

    /**
     * Update popup text
     */
    updatePopupText() {
        document.getElementById('popupNewsletterTitle').textContent = this.t('subscribeTitle');
        document.getElementById('popupNewsletterDesc').textContent = this.t('subscribeDesc');
        document.getElementById('popup10Off').textContent = this.t('discount10');
        document.getElementById('popupNewProducts').textContent = this.t('newProducts');
        document.getElementById('popupExclusive').textContent = this.t('exclusiveOffers');
        document.getElementById('popupSubscribeBtn').textContent = this.t('subscribeButton');
        document.getElementById('popupNoSpam').textContent = this.t('noSpam');
        document.getElementById('popupNewsletterEmail').placeholder = this.t('emailPlaceholder');
    }

    /**
     * Schedule popup to show
     */
    schedulePopup() {
        // Check if already subscribed or popup shown
        const popupDismissed = localStorage.getItem('newsletterPopupDismissed');
        if (popupDismissed) return;
        
        // Show after 30 seconds
        setTimeout(() => {
            if (!this.popupShown && !this.isSubscribed()) {
                this.showPopup();
            }
        }, 30000);
    }

    /**
     * Show popup
     */
    showPopup() {
        this.popup.classList.remove('hidden');
        this.popupShown = true;
    }

    /**
     * Hide popup
     */
    hidePopup() {
        this.popup.classList.add('hidden');
        localStorage.setItem('newsletterPopupDismissed', 'true');
    }

    /**
     * Subscribe email
     */
    subscribe(email) {
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showNotification('error', this.t('invalidEmail'));
            return;
        }
        
        // Check if already subscribed
        if (this.subscribers.includes(email)) {
            this.showNotification('info', this.t('alreadySubscribed'));
            return;
        }
        
        // Add subscriber
        this.subscribers.push(email);
        this.saveSubscribers();
        
        // Clear forms
        document.getElementById('footerNewsletterEmail').value = '';
        if (document.getElementById('popupNewsletterEmail')) {
            document.getElementById('popupNewsletterEmail').value = '';
        }
        
        // Hide popup
        this.hidePopup();
        
        // Show success notification
        this.showNotification('success', `${this.t('thankYou')} ${this.t('checkEmail')}`);
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('newsletterSubscribed', {
            detail: { email }
        }));
    }

    /**
     * Check if email is subscribed
     */
    isSubscribed(email = null) {
        if (!email) {
            return this.subscribers.length > 0;
        }
        return this.subscribers.includes(email);
    }

    /**
     * Update language
     */
    updateLanguage() {
        this.updateFooterText();
        this.updatePopupText();
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

export default NewsletterManager;
