/**
 * Loyalty Program Manager
 * Handles customer loyalty points, rewards, and tiers
 * @module managers/LoyaltyProgramManager
 */

export class LoyaltyProgramManager {
    constructor(appState, config) {
        this.appState = appState;
        this.config = config;
        this.currentLanguage = 'vi';
        this.userPoints = 0;
        this.pointsHistory = [];
        
        // Loyalty tiers
        this.tiers = {
            bronze: { minPoints: 0, name: 'Bronze', discount: 0, icon: '🥉' },
            silver: { minPoints: 500, name: 'Silver', discount: 5, icon: '🥈' },
            gold: { minPoints: 1500, name: 'Gold', discount: 10, icon: '🥇' },
            platinum: { minPoints: 3000, name: 'Platinum', discount: 15, icon: '💎' }
        };
        
        // Points conversion: 1000₫ = 1 point
        this.pointsPerThousand = 1;
        
        // Redemption: 100 points = 10,000₫ discount
        this.redemptionRate = 100; // points per 10k discount
        
        // Translations
        this.translations = {
            vi: {
                loyaltyProgram: 'Chương trình thành viên',
                yourPoints: 'Điểm của bạn',
                currentTier: 'Hạng hiện tại',
                nextTier: 'Hạng tiếp theo',
                earnPoints: 'Tích điểm',
                redeemPoints: 'Đổi điểm',
                pointsHistory: 'Lịch sử điểm',
                earned: 'Đã tích',
                redeemed: 'Đã đổi',
                points: 'điểm',
                viewDetails: 'Xem chi tiết',
                howItWorks: 'Cách hoạt động',
                rule1: 'Mua hàng 1,000₫ = 1 điểm',
                rule2: '100 điểm = Giảm 10,000₫',
                rule3: 'Tích điểm lên hạng cao hơn',
                tierBenefits: 'Quyền lợi theo hạng',
                bronze: 'Đồng',
                silver: 'Bạc',
                gold: 'Vàng',
                platinum: 'Bạch Kim',
                discount: 'Giảm giá',
                close: 'Đóng',
                loginRequired: 'Vui lòng đăng nhập để tham gia chương trình thành viên',
                pointsEarned: 'Bạn đã tích được',
                pointsRedeemed: 'Bạn đã đổi',
                notEnoughPoints: 'Không đủ điểm',
                redeemSuccess: 'Đổi điểm thành công!'
            },
            en: {
                loyaltyProgram: 'Loyalty Program',
                yourPoints: 'Your Points',
                currentTier: 'Current Tier',
                nextTier: 'Next Tier',
                earnPoints: 'Earn Points',
                redeemPoints: 'Redeem Points',
                pointsHistory: 'Points History',
                earned: 'Earned',
                redeemed: 'Redeemed',
                points: 'points',
                viewDetails: 'View Details',
                howItWorks: 'How It Works',
                rule1: 'Spend ₫1,000 = 1 point',
                rule2: '100 points = ₫10,000 discount',
                rule3: 'Collect points to reach higher tiers',
                tierBenefits: 'Tier Benefits',
                bronze: 'Bronze',
                silver: 'Silver',
                gold: 'Gold',
                platinum: 'Platinum',
                discount: 'Discount',
                close: 'Close',
                loginRequired: 'Please login to join loyalty program',
                pointsEarned: 'You earned',
                pointsRedeemed: 'You redeemed',
                notEnoughPoints: 'Not enough points',
                redeemSuccess: 'Points redeemed successfully!'
            }
        };
    }

    /**
     * Initialize loyalty program
     */
    init() {
        console.log('[LoyaltyProgramManager] Initializing...');
        
        // Load language
        this.currentLanguage = this.appState.get('currentLanguage') || 'vi';
        
        // Listen for language changes
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            this.updateLanguage();
        });
        
        // Load user points
        this.loadUserPoints();
        
        // Create loyalty badge in navbar
        this.createLoyaltyBadge();
        
        // Create loyalty modal
        this.createLoyaltyModal();
        
        // Listen for purchase events
        document.addEventListener('orderPlaced', (e) => {
            this.handlePurchase(e.detail);
        });
        
        // Listen for user login
        document.addEventListener('userLoggedIn', () => {
            this.loadUserPoints();
            this.updateLoyaltyBadge();
        });
        
        console.log('[LoyaltyProgramManager] Initialized');
    }

    /**
     * Load user points from localStorage
     */
    loadUserPoints() {
        const currentUser = this.appState.get('currentUser');
        if (!currentUser) {
            this.userPoints = 0;
            this.pointsHistory = [];
            return;
        }
        
        try {
            const stored = localStorage.getItem(`loyaltyPoints_${currentUser.email}`);
            if (stored) {
                const data = JSON.parse(stored);
                this.userPoints = data.points || 0;
                this.pointsHistory = data.history || [];
            }
        } catch (error) {
            console.error('[LoyaltyProgramManager] Failed to load points:', error);
        }
    }

    /**
     * Save user points
     */
    saveUserPoints() {
        const currentUser = this.appState.get('currentUser');
        if (!currentUser) return;
        
        try {
            const data = {
                points: this.userPoints,
                history: this.pointsHistory
            };
            localStorage.setItem(`loyaltyPoints_${currentUser.email}`, JSON.stringify(data));
        } catch (error) {
            console.error('[LoyaltyProgramManager] Failed to save points:', error);
        }
    }

    /**
     * Create loyalty badge in navbar
     */
    createLoyaltyBadge() {
        const navActions = document.querySelector('.nav-actions');
        if (!navActions) return;
        
        const badge = document.createElement('button');
        badge.id = 'loyaltyBadge';
        badge.className = 'hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500 transition-all shadow-lg';
        badge.innerHTML = `
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span id="loyaltyPoints" class="font-bold">0</span>
        `;
        
        badge.addEventListener('click', () => this.showLoyaltyModal());
        
        // Insert before language switcher
        const langSwitch = document.getElementById('langSwitch');
        if (langSwitch) {
            langSwitch.before(badge);
        }
        
        this.updateLoyaltyBadge();
    }

    /**
     * Update loyalty badge
     */
    updateLoyaltyBadge() {
        const badge = document.getElementById('loyaltyBadge');
        const pointsDisplay = document.getElementById('loyaltyPoints');
        
        const currentUser = this.appState.get('currentUser');
        if (currentUser && badge) {
            badge.classList.remove('hidden');
            if (pointsDisplay) {
                pointsDisplay.textContent = this.userPoints;
            }
        } else if (badge) {
            badge.classList.add('hidden');
        }
    }

    /**
     * Create loyalty modal
     */
    createLoyaltyModal() {
        const modal = document.createElement('div');
        modal.id = 'loyaltyModal';
        modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm hidden z-[100] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                <button id="closeLoyaltyModal" class="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition z-10">
                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>

                <div class="p-8">
                    <h2 class="text-3xl font-bold mb-6 flex items-center gap-2">
                        <svg class="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span id="loyaltyTitle"></span>
                    </h2>
                    
                    <div id="loyaltyContent"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
        
        // Event listeners
        document.getElementById('closeLoyaltyModal')?.addEventListener('click', () => this.hideLoyaltyModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideLoyaltyModal();
        });
    }

    /**
     * Show loyalty modal
     */
    showLoyaltyModal() {
        const currentUser = this.appState.get('currentUser');
        if (!currentUser) {
            this.showNotification('error', this.t('loginRequired'));
            return;
        }
        
        this.renderLoyaltyContent();
        this.modal.classList.remove('hidden');
    }

    /**
     * Hide loyalty modal
     */
    hideLoyaltyModal() {
        this.modal.classList.add('hidden');
    }

    /**
     * Render loyalty content
     */
    renderLoyaltyContent() {
        const content = document.getElementById('loyaltyContent');
        const title = document.getElementById('loyaltyTitle');
        
        if (title) title.textContent = this.t('loyaltyProgram');
        
        const currentTier = this.getCurrentTier();
        const nextTier = this.getNextTier();
        const pointsToNext = nextTier ? nextTier.minPoints - this.userPoints : 0;
        
        content.innerHTML = `
            <!-- Points Summary -->
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-gradient-to-br from-yellow-400 to-orange-400 p-6 rounded-2xl text-white">
                    <p class="text-sm opacity-90">${this.t('yourPoints')}</p>
                    <p class="text-4xl font-bold mt-2">${this.userPoints}</p>
                    <p class="text-sm mt-1">${this.t('points')}</p>
                </div>
                <div class="bg-gradient-to-br from-purple-400 to-pink-400 p-6 rounded-2xl text-white">
                    <p class="text-sm opacity-90">${this.t('currentTier')}</p>
                    <p class="text-3xl font-bold mt-2">${currentTier.icon} ${this.t(currentTier.name.toLowerCase())}</p>
                    <p class="text-sm mt-1">${currentTier.discount}% ${this.t('discount')}</p>
                </div>
            </div>
            
            ${nextTier ? `
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p class="text-sm text-blue-800 font-semibold">${this.t('nextTier')}: ${nextTier.icon} ${this.t(nextTier.name.toLowerCase())}</p>
                <div class="mt-2 bg-blue-200 rounded-full h-3 overflow-hidden">
                    <div class="bg-blue-500 h-full transition-all" style="width: ${Math.min(100, (this.userPoints / nextTier.minPoints) * 100)}%"></div>
                </div>
                <p class="text-xs text-blue-600 mt-1">${pointsToNext} ${this.t('points')} to ${nextTier.icon}</p>
            </div>
            ` : ''}
            
            <!-- How It Works -->
            <div class="mb-6">
                <h3 class="text-xl font-bold mb-4">${this.t('howItWorks')}</h3>
                <div class="space-y-3">
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-primary font-bold">1</span>
                        </div>
                        <p class="text-gray-700">${this.t('rule1')}</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-primary font-bold">2</span>
                        </div>
                        <p class="text-gray-700">${this.t('rule2')}</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-primary font-bold">3</span>
                        </div>
                        <p class="text-gray-700">${this.t('rule3')}</p>
                    </div>
                </div>
            </div>
            
            <!-- Tier Benefits -->
            <div class="mb-6">
                <h3 class="text-xl font-bold mb-4">${this.t('tierBenefits')}</h3>
                <div class="grid grid-cols-2 gap-3">
                    ${Object.values(this.tiers).map(tier => `
                        <div class="border-2 ${currentTier.name === tier.name ? 'border-primary bg-primary/5' : 'border-gray-200'} rounded-xl p-4">
                            <div class="text-3xl mb-2">${tier.icon}</div>
                            <p class="font-bold text-gray-800">${this.t(tier.name.toLowerCase())}</p>
                            <p class="text-sm text-gray-600">${tier.minPoints}+ ${this.t('points')}</p>
                            <p class="text-primary font-semibold mt-1">${tier.discount}% ${this.t('discount')}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Redeem Points -->
            ${this.userPoints >= this.redemptionRate ? `
            <div class="bg-green-50 border border-green-200 rounded-xl p-4">
                <p class="font-semibold text-green-800 mb-3">${this.t('redeemPoints')}</p>
                <button id="redeemPointsBtn" class="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold">
                    ${this.t('redeemPoints')} (100 pts = 10,000₫)
                </button>
            </div>
            ` : ''}
        `;
        
        // Attach redeem button listener
        document.getElementById('redeemPointsBtn')?.addEventListener('click', () => this.redeemPoints(100));
    }

    /**
     * Handle purchase and award points
     */
    handlePurchase(orderData) {
        const currentUser = this.appState.get('currentUser');
        if (!currentUser) return;
        
        const totalAmount = orderData.total || 0;
        const pointsEarned = Math.floor(totalAmount / 1000) * this.pointsPerThousand;
        
        this.userPoints += pointsEarned;
        this.pointsHistory.push({
            type: 'earned',
            points: pointsEarned,
            amount: totalAmount,
            date: new Date().toISOString()
        });
        
        this.saveUserPoints();
        this.updateLoyaltyBadge();
        
        // Show notification
        this.showNotification('success', `${this.t('pointsEarned')} ${pointsEarned} ${this.t('points')}! 🎉`);
    }

    /**
     * Redeem points
     */
    redeemPoints(points) {
        if (this.userPoints < points) {
            this.showNotification('error', this.t('notEnoughPoints'));
            return;
        }
        
        this.userPoints -= points;
        const discount = (points / this.redemptionRate) * 10000;
        
        this.pointsHistory.push({
            type: 'redeemed',
            points: points,
            discount: discount,
            date: new Date().toISOString()
        });
        
        this.saveUserPoints();
        this.updateLoyaltyBadge();
        this.renderLoyaltyContent();
        
        this.showNotification('success', this.t('redeemSuccess'));
        
        // Dispatch event for cart to apply discount
        document.dispatchEvent(new CustomEvent('loyaltyDiscountApplied', {
            detail: { discount: discount }
        }));
    }

    /**
     * Get current tier
     */
    getCurrentTier() {
        const tiers = Object.values(this.tiers).sort((a, b) => b.minPoints - a.minPoints);
        return tiers.find(tier => this.userPoints >= tier.minPoints) || this.tiers.bronze;
    }

    /**
     * Get next tier
     */
    getNextTier() {
        const currentTier = this.getCurrentTier();
        const tiers = Object.values(this.tiers).sort((a, b) => a.minPoints - b.minPoints);
        const currentIndex = tiers.findIndex(t => t.name === currentTier.name);
        return tiers[currentIndex + 1] || null;
    }

    /**
     * Get tier discount
     */
    getTierDiscount() {
        return this.getCurrentTier().discount;
    }

    /**
     * Update language
     */
    updateLanguage() {
        if (this.modal && !this.modal.classList.contains('hidden')) {
            this.renderLoyaltyContent();
        }
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

export default LoyaltyProgramManager;
