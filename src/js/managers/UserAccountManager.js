/**
 * User Account Manager
 * Handles user registration, login, profile management
 * @module managers/UserAccountManager
 */

export class UserAccountManager {
    constructor(appState, config) {
        this.appState = appState;
        this.config = config;
        this.currentUser = null;
        this.users = [];
        this.loginModal = null;
        this.profileModal = null;
        this.currentLanguage = 'vi';
        
        // Translation dictionary
        this.translations = {
            vi: {
                login: 'Đăng nhập',
                register: 'Đăng ký',
                logout: 'Đăng xuất',
                myAccount: 'Tài khoản của tôi',
                profile: 'Hồ sơ',
                email: 'Email',
                password: 'Mật khẩu',
                confirmPassword: 'Xác nhận mật khẩu',
                fullName: 'Họ và tên',
                phone: 'Số điện thoại',
                address: 'Địa chỉ',
                loginTitle: 'Đăng nhập tài khoản',
                registerTitle: 'Đăng ký tài khoản',
                noAccount: 'Chưa có tài khoản?',
                hasAccount: 'Đã có tài khoản?',
                registerNow: 'Đăng ký ngay',
                loginNow: 'Đăng nhập ngay',
                loginButton: 'Đăng nhập',
                registerButton: 'Đăng ký',
                cancel: 'Hủy',
                save: 'Lưu',
                editProfile: 'Chỉnh sửa hồ sơ',
                myOrders: 'Đơn hàng của tôi',
                myWishlist: 'Sản phẩm yêu thích',
                loginSuccess: 'Đăng nhập thành công!',
                registerSuccess: 'Đăng ký thành công!',
                logoutSuccess: 'Đã đăng xuất',
                updateSuccess: 'Cập nhật thông tin thành công!',
                emailRequired: 'Vui lòng nhập email',
                passwordRequired: 'Vui lòng nhập mật khẩu',
                passwordMismatch: 'Mật khẩu không khớp',
                emailExists: 'Email đã được sử dụng',
                invalidLogin: 'Email hoặc mật khẩu không đúng',
                namePlaceholder: 'Nguyễn Văn A',
                emailPlaceholder: 'email@example.com',
                phonePlaceholder: '0123456789',
                addressPlaceholder: '123 Đường ABC, Quận XYZ, TP.HCM'
            },
            en: {
                login: 'Login',
                register: 'Register',
                logout: 'Logout',
                myAccount: 'My Account',
                profile: 'Profile',
                email: 'Email',
                password: 'Password',
                confirmPassword: 'Confirm Password',
                fullName: 'Full Name',
                phone: 'Phone',
                address: 'Address',
                loginTitle: 'Login to Your Account',
                registerTitle: 'Create New Account',
                noAccount: "Don't have an account?",
                hasAccount: 'Already have an account?',
                registerNow: 'Register now',
                loginNow: 'Login now',
                loginButton: 'Login',
                registerButton: 'Register',
                cancel: 'Cancel',
                save: 'Save',
                editProfile: 'Edit Profile',
                myOrders: 'My Orders',
                myWishlist: 'My Wishlist',
                loginSuccess: 'Login successful!',
                registerSuccess: 'Registration successful!',
                logoutSuccess: 'Logged out',
                updateSuccess: 'Profile updated successfully!',
                emailRequired: 'Please enter email',
                passwordRequired: 'Please enter password',
                passwordMismatch: 'Passwords do not match',
                emailExists: 'Email already in use',
                invalidLogin: 'Invalid email or password',
                namePlaceholder: 'John Doe',
                emailPlaceholder: 'email@example.com',
                phonePlaceholder: '(123) 456-7890',
                addressPlaceholder: '123 Main Street, City, State'
            }
        };
    }

    /**
     * Initialize user account system
     */
    init() {
        console.log('[UserAccountManager] Initializing...');
        
        // Load language
        this.currentLanguage = this.appState.get('currentLanguage') || 'vi';
        
        // Listen for language changes
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            this.updateLanguage();
        });
        
        // Load users from localStorage
        this.loadUsers();
        
        // Load current user session
        this.loadSession();
        
        // Create modals
        this.createLoginModal();
        this.createProfileModal();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Update UI
        this.updateUserUI();
        
        console.log('[UserAccountManager] Initialized');
    }

    /**
     * Load users from localStorage
     */
    loadUsers() {
        try {
            const stored = localStorage.getItem('users');
            this.users = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('[UserAccountManager] Failed to load users:', error);
            this.users = [];
        }
    }

    /**
     * Save users to localStorage
     */
    saveUsers() {
        try {
            localStorage.setItem('users', JSON.stringify(this.users));
        } catch (error) {
            console.error('[UserAccountManager] Failed to save users:', error);
        }
    }

    /**
     * Load current session
     */
    loadSession() {
        try {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                this.currentUser = JSON.parse(stored);
                this.appState.set('currentUser', this.currentUser);
            }
        } catch (error) {
            console.error('[UserAccountManager] Failed to load session:', error);
        }
    }

    /**
     * Save current session
     */
    saveSession() {
        try {
            if (this.currentUser) {
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.appState.set('currentUser', this.currentUser);
            } else {
                localStorage.removeItem('currentUser');
                this.appState.set('currentUser', null);
            }
        } catch (error) {
            console.error('[UserAccountManager] Failed to save session:', error);
        }
    }

    /**
     * Create login/register modal
     */
    createLoginModal() {
        const modal = document.createElement('div');
        modal.id = 'loginModal';
        modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm hidden z-[100] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
                <!-- Close Button -->
                <button id="closeLoginModal" class="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition z-10">
                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>

                <div class="p-8">
                    <!-- Login Form -->
                    <div id="loginForm">
                        <h2 class="text-3xl font-bold mb-6 flex items-center gap-2">
                            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                            <span id="loginTitle"></span>
                        </h2>
                        
                        <form id="loginFormElement" class="space-y-4">
                            <div>
                                <label for="loginEmail" class="block text-sm font-semibold mb-2" id="loginEmailLabel"></label>
                                <input type="email" id="loginEmail" required 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition">
                            </div>
                            
                            <div>
                                <label for="loginPassword" class="block text-sm font-semibold mb-2" id="loginPasswordLabel"></label>
                                <input type="password" id="loginPassword" required 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition">
                            </div>
                            
                            <button type="submit" class="w-full py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-semibold text-lg">
                                <span id="loginButtonText"></span>
                            </button>
                        </form>
                        
                        <p class="text-center mt-4 text-sm text-gray-600">
                            <span id="noAccountText"></span>
                            <button id="switchToRegister" class="text-primary font-semibold hover:underline ml-1"></button>
                        </p>
                    </div>

                    <!-- Register Form -->
                    <div id="registerForm" class="hidden">
                        <h2 class="text-3xl font-bold mb-6 flex items-center gap-2">
                            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                            </svg>
                            <span id="registerTitle"></span>
                        </h2>
                        
                        <form id="registerFormElement" class="space-y-4">
                            <div>
                                <label for="registerName" class="block text-sm font-semibold mb-2" id="registerNameLabel"></label>
                                <input type="text" id="registerName" required 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition">
                            </div>
                            
                            <div>
                                <label for="registerEmail" class="block text-sm font-semibold mb-2" id="registerEmailLabel"></label>
                                <input type="email" id="registerEmail" required 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition">
                            </div>
                            
                            <div>
                                <label for="registerPhone" class="block text-sm font-semibold mb-2" id="registerPhoneLabel"></label>
                                <input type="tel" id="registerPhone" required 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition">
                            </div>
                            
                            <div>
                                <label for="registerPassword" class="block text-sm font-semibold mb-2" id="registerPasswordLabel"></label>
                                <input type="password" id="registerPassword" required 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition">
                            </div>
                            
                            <div>
                                <label for="registerConfirmPassword" class="block text-sm font-semibold mb-2" id="registerConfirmPasswordLabel"></label>
                                <input type="password" id="registerConfirmPassword" required 
                                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition">
                            </div>
                            
                            <button type="submit" class="w-full py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-semibold text-lg">
                                <span id="registerButtonText"></span>
                            </button>
                        </form>
                        
                        <p class="text-center mt-4 text-sm text-gray-600">
                            <span id="hasAccountText"></span>
                            <button id="switchToLogin" class="text-primary font-semibold hover:underline ml-1"></button>
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.loginModal = modal;
        this.updateLoginModalLanguage();
    }

    /**
     * Create profile modal
     */
    createProfileModal() {
        const modal = document.createElement('div');
        modal.id = 'profileModal';
        modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm hidden z-[100] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
                <button id="closeProfileModal" class="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition z-10">
                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>

                <div class="p-8">
                    <h2 class="text-3xl font-bold mb-6 flex items-center gap-2">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <span id="profileTitle"></span>
                    </h2>
                    
                    <form id="profileFormElement" class="space-y-4">
                        <div>
                            <label for="profileName" class="block text-sm font-semibold mb-2" id="profileNameLabel"></label>
                            <input type="text" id="profileName" required 
                                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition">
                        </div>
                        
                        <div>
                            <label for="profileEmail" class="block text-sm font-semibold mb-2" id="profileEmailLabel"></label>
                            <input type="email" id="profileEmail" disabled 
                                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed">
                        </div>
                        
                        <div>
                            <label for="profilePhone" class="block text-sm font-semibold mb-2" id="profilePhoneLabel"></label>
                            <input type="tel" id="profilePhone" required 
                                   class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition">
                        </div>
                        
                        <div>
                            <label for="profileAddress" class="block text-sm font-semibold mb-2" id="profileAddressLabel"></label>
                            <textarea id="profileAddress" rows="3" 
                                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition resize-none"></textarea>
                        </div>
                        
                        <div class="flex gap-3">
                            <button type="submit" class="flex-1 py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-semibold">
                                <span id="profileSaveButton"></span>
                            </button>
                            <button type="button" id="cancelProfile" class="px-6 py-4 border-2 border-gray-300 rounded-xl hover:border-gray-400 transition">
                                <span id="profileCancelButton"></span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.profileModal = modal;
        this.updateProfileModalLanguage();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Login modal events
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }

        document.getElementById('closeLoginModal')?.addEventListener('click', () => this.hideLoginModal());
        document.getElementById('loginFormElement')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerFormElement')?.addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('switchToRegister')?.addEventListener('click', () => this.switchToRegister());
        document.getElementById('switchToLogin')?.addEventListener('click', () => this.switchToLogin());

        // Profile modal events
        document.getElementById('closeProfileModal')?.addEventListener('click', () => this.hideProfileModal());
        document.getElementById('profileFormElement')?.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        document.getElementById('cancelProfile')?.addEventListener('click', () => this.hideProfileModal());

        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());

        // Profile button
        document.getElementById('profileBtn')?.addEventListener('click', () => this.showProfileModal());
    }

    /**
     * Handle login
     */
    handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showNotification('error', this.t('emailRequired'));
            return;
        }

        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = { ...user };
            delete this.currentUser.password; // Don't store password in session
            this.saveSession();
            this.updateUserUI();
            this.hideLoginModal();
            this.showNotification('success', this.t('loginSuccess'));
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: this.currentUser }));
        } else {
            this.showNotification('error', this.t('invalidLogin'));
        }
    }

    /**
     * Handle register
     */
    handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (!email || !password) {
            this.showNotification('error', this.t('emailRequired'));
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('error', this.t('passwordMismatch'));
            return;
        }

        if (this.users.find(u => u.email === email)) {
            this.showNotification('error', this.t('emailExists'));
            return;
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            phone,
            password,
            address: '',
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();

        this.currentUser = { ...newUser };
        delete this.currentUser.password;
        this.saveSession();
        
        this.updateUserUI();
        this.hideLoginModal();
        this.showNotification('success', this.t('registerSuccess'));
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('userRegistered', { detail: this.currentUser }));
    }

    /**
     * Handle profile update
     */
    handleProfileUpdate(e) {
        e.preventDefault();
        
        const name = document.getElementById('profileName').value;
        const phone = document.getElementById('profilePhone').value;
        const address = document.getElementById('profileAddress').value;

        this.currentUser.name = name;
        this.currentUser.phone = phone;
        this.currentUser.address = address;

        // Update in users array
        const userIndex = this.users.findIndex(u => u.email === this.currentUser.email);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.users[userIndex], name, phone, address };
            this.saveUsers();
        }

        this.saveSession();
        this.updateUserUI();
        this.hideProfileModal();
        this.showNotification('success', this.t('updateSuccess'));
    }

    /**
     * Logout
     */
    logout() {
        this.currentUser = null;
        this.saveSession();
        this.updateUserUI();
        this.showNotification('success', this.t('logoutSuccess'));
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('userLoggedOut'));
    }

    /**
     * Show login modal
     */
    showLoginModal(showRegister = false) {
        if (showRegister) {
            this.switchToRegister();
        } else {
            this.switchToLogin();
        }
        this.loginModal.classList.remove('hidden');
    }

    /**
     * Hide login modal
     */
    hideLoginModal() {
        this.loginModal.classList.add('hidden');
        document.getElementById('loginFormElement').reset();
        document.getElementById('registerFormElement').reset();
    }

    /**
     * Show profile modal
     */
    showProfileModal() {
        if (!this.currentUser) {
            this.showLoginModal();
            return;
        }

        document.getElementById('profileName').value = this.currentUser.name || '';
        document.getElementById('profileEmail').value = this.currentUser.email || '';
        document.getElementById('profilePhone').value = this.currentUser.phone || '';
        document.getElementById('profileAddress').value = this.currentUser.address || '';

        this.profileModal.classList.remove('hidden');
    }

    /**
     * Hide profile modal
     */
    hideProfileModal() {
        this.profileModal.classList.add('hidden');
    }

    /**
     * Switch to register form
     */
    switchToRegister() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
    }

    /**
     * Switch to login form
     */
    switchToLogin() {
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
    }

    /**
     * Update user UI
     */
    updateUserUI() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const profileBtn = document.getElementById('profileBtn');
        const userNameDisplay = document.getElementById('userNameDisplay');

        if (this.currentUser) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (profileBtn) profileBtn.classList.remove('hidden');
            if (userNameDisplay) {
                userNameDisplay.textContent = this.currentUser.name;
                userNameDisplay.classList.remove('hidden');
            }
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
            if (profileBtn) profileBtn.classList.add('hidden');
            if (userNameDisplay) userNameDisplay.classList.add('hidden');
        }
    }

    /**
     * Update language for all dynamic content
     */
    updateLanguage() {
        this.updateLoginModalLanguage();
        this.updateProfileModalLanguage();
    }

    /**
     * Update login modal language
     */
    updateLoginModalLanguage() {
        document.getElementById('loginTitle').textContent = this.t('loginTitle');
        document.getElementById('registerTitle').textContent = this.t('registerTitle');
        
        document.getElementById('loginEmailLabel').textContent = this.t('email');
        document.getElementById('loginPasswordLabel').textContent = this.t('password');
        document.getElementById('loginButtonText').textContent = this.t('loginButton');
        document.getElementById('noAccountText').textContent = this.t('noAccount');
        document.getElementById('switchToRegister').textContent = this.t('registerNow');
        
        document.getElementById('registerNameLabel').textContent = this.t('fullName');
        document.getElementById('registerEmailLabel').textContent = this.t('email');
        document.getElementById('registerPhoneLabel').textContent = this.t('phone');
        document.getElementById('registerPasswordLabel').textContent = this.t('password');
        document.getElementById('registerConfirmPasswordLabel').textContent = this.t('confirmPassword');
        document.getElementById('registerButtonText').textContent = this.t('registerButton');
        document.getElementById('hasAccountText').textContent = this.t('hasAccount');
        document.getElementById('switchToLogin').textContent = this.t('loginNow');
        
        // Update placeholders
        document.getElementById('loginEmail').placeholder = this.t('emailPlaceholder');
        document.getElementById('registerName').placeholder = this.t('namePlaceholder');
        document.getElementById('registerEmail').placeholder = this.t('emailPlaceholder');
        document.getElementById('registerPhone').placeholder = this.t('phonePlaceholder');
    }

    /**
     * Update profile modal language
     */
    updateProfileModalLanguage() {
        document.getElementById('profileTitle').textContent = this.t('editProfile');
        document.getElementById('profileNameLabel').textContent = this.t('fullName');
        document.getElementById('profileEmailLabel').textContent = this.t('email');
        document.getElementById('profilePhoneLabel').textContent = this.t('phone');
        document.getElementById('profileAddressLabel').textContent = this.t('address');
        document.getElementById('profileSaveButton').textContent = this.t('save');
        document.getElementById('profileCancelButton').textContent = this.t('cancel');
        
        // Update placeholders
        document.getElementById('profileName').placeholder = this.t('namePlaceholder');
        document.getElementById('profilePhone').placeholder = this.t('phonePlaceholder');
        document.getElementById('profileAddress').placeholder = this.t('addressPlaceholder');
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

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }
}

export default UserAccountManager;
