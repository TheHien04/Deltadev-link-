/**
 * AdminDashboardManager.js
 * Manages the admin dashboard with order management, user management, 
 * loyalty program overview, newsletter subscribers, and analytics
 */

export default class AdminDashboardManager {
    constructor(appState, config) {
        this.appState = appState;
        this.config = config;
        this.currentLanguage = 'en';
        this.currentSection = 'overview';
        
        // Admin credentials (in production, use proper authentication)
        this.adminPassword = 'admin123';
        this.isAuthenticated = false;
        
        // Translations
        this.translations = {
            vi: {
                // Login
                adminLogin: 'Đăng nhập quản trị',
                password: 'Mật khẩu',
                loginButton: 'Đăng nhập',
                wrongPassword: 'Mật khẩu không đúng!',
                
                // Navigation
                overview: 'Tổng quan',
                orders: 'Đơn hàng',
                users: 'Người dùng',
                loyalty: 'Tích điểm',
                newsletter: 'Newsletter',
                products: 'Sản phẩm',
                logout: 'Đăng xuất',
                
                // Overview
                totalRevenue: 'Tổng doanh thu',
                totalOrders: 'Tổng đơn hàng',
                totalUsers: 'Người dùng',
                subscribers: 'Người đăng ký',
                avgOrderValue: 'Giá trị TB/đơn',
                topProducts: 'Sản phẩm bán chạy',
                recentOrders: 'Đơn hàng gần đây',
                
                // Orders
                orderList: 'Danh sách đơn hàng',
                orderId: 'Mã ĐH',
                customer: 'Khách hàng',
                date: 'Ngày',
                total: 'Tổng tiền',
                status: 'Trạng thái',
                actions: 'Thao tác',
                viewDetails: 'Xem chi tiết',
                pending: 'Chờ xử lý',
                processing: 'Đang xử lý',
                shipped: 'Đã gửi',
                delivered: 'Đã giao',
                cancelled: 'Đã hủy',
                
                // Users
                userList: 'Danh sách người dùng',
                name: 'Tên',
                email: 'Email',
                phone: 'Số điện thoại',
                registered: 'Ngày đăng ký',
                loyaltyTier: 'Hạng thành viên',
                points: 'Điểm',
                
                // Loyalty
                loyaltyOverview: 'Tổng quan tích điểm',
                totalPoints: 'Tổng điểm đã tích',
                pointsRedeemed: 'Điểm đã đổi',
                activeMembers: 'Thành viên hoạt động',
                tierDistribution: 'Phân bố hạng',
                bronze: 'Đồng',
                silver: 'Bạc',
                gold: 'Vàng',
                platinum: 'Bạch kim',
                
                // Newsletter
                newsletterList: 'Danh sách đăng ký',
                subscribedDate: 'Ngày đăng ký',
                exportList: 'Xuất danh sách',
                
                // Products
                productList: 'Danh sách sản phẩm',
                productName: 'Tên sản phẩm',
                price: 'Giá',
                stock: 'Tồn kho',
                sold: 'Đã bán',
                addProduct: 'Thêm sản phẩm',
                editProduct: 'Sửa',
                deleteProduct: 'Xóa',
                
                // Common
                search: 'Tìm kiếm...',
                filter: 'Lọc',
                export: 'Xuất',
                refresh: 'Làm mới',
                noData: 'Không có dữ liệu',
                loading: 'Đang tải...',
            },
            en: {
                // Login
                adminLogin: 'Admin Login',
                password: 'Password',
                loginButton: 'Login',
                wrongPassword: 'Wrong password!',
                
                // Navigation
                overview: 'Overview',
                orders: 'Orders',
                users: 'Users',
                loyalty: 'Loyalty',
                newsletter: 'Newsletter',
                products: 'Products',
                logout: 'Logout',
                
                // Overview
                totalRevenue: 'Total Revenue',
                totalOrders: 'Total Orders',
                totalUsers: 'Users',
                subscribers: 'Subscribers',
                avgOrderValue: 'Avg Order Value',
                topProducts: 'Top Products',
                recentOrders: 'Recent Orders',
                
                // Orders
                orderList: 'Order List',
                orderId: 'Order ID',
                customer: 'Customer',
                date: 'Date',
                total: 'Total',
                status: 'Status',
                actions: 'Actions',
                viewDetails: 'View Details',
                pending: 'Pending',
                processing: 'Processing',
                shipped: 'Shipped',
                delivered: 'Delivered',
                cancelled: 'Cancelled',
                
                // Users
                userList: 'User List',
                name: 'Name',
                email: 'Email',
                phone: 'Phone',
                registered: 'Registered',
                loyaltyTier: 'Tier',
                points: 'Points',
                
                // Loyalty
                loyaltyOverview: 'Loyalty Overview',
                totalPoints: 'Total Points Earned',
                pointsRedeemed: 'Points Redeemed',
                activeMembers: 'Active Members',
                tierDistribution: 'Tier Distribution',
                bronze: 'Bronze',
                silver: 'Silver',
                gold: 'Gold',
                platinum: 'Platinum',
                
                // Newsletter
                newsletterList: 'Subscriber List',
                subscribedDate: 'Subscribed',
                exportList: 'Export List',
                
                // Products
                productList: 'Product List',
                productName: 'Product Name',
                price: 'Price',
                stock: 'Stock',
                sold: 'Sold',
                addProduct: 'Add Product',
                editProduct: 'Edit',
                deleteProduct: 'Delete',
                
                // Common
                search: 'Search...',
                filter: 'Filter',
                export: 'Export',
                refresh: 'Refresh',
                noData: 'No data',
                loading: 'Loading...',
            }
        };
    }

    init() {
        console.log('AdminDashboardManager initialized');
        this.currentLanguage = this.appState.get('currentLanguage') || 'en';
        this.checkAuthentication();
        this.setupEventListeners();
    }

    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    checkAuthentication() {
        const isAuth = localStorage.getItem('adminAuthenticated');
        this.isAuthenticated = isAuth === 'true';
        
        if (!this.isAuthenticated) {
            this.showLoginScreen();
        } else {
            this.showDashboard();
        }
    }

    showLoginScreen() {
        const container = document.getElementById('adminContent');
        if (!container) return;
        
        container.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <!-- Language Toggle for Login -->
                <div class="absolute top-6 right-6">
                    <div class="flex items-center bg-white rounded-lg p-1 shadow-md">
                        <button id="loginLangViBtn" class="${this.currentLanguage === 'vi' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'} px-3 py-1.5 rounded-md text-sm font-semibold transition-all" data-lang="vi">
                            🇻🇳 VI
                        </button>
                        <button id="loginLangEnBtn" class="${this.currentLanguage === 'en' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'} px-3 py-1.5 rounded-md text-sm font-semibold transition-all" data-lang="en">
                            🇬🇧 EN
                        </button>
                    </div>
                </div>
                
                <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                    <div class="text-center mb-8">
                        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-800">${this.t('adminLogin')}</h1>
                    </div>
                    
                    <form id="adminLoginForm" class="space-y-6">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">${this.t('password')}</label>
                            <input 
                                type="password" 
                                id="adminPasswordInput"
                                class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                                placeholder="••••••••"
                                required
                            >
                        </div>
                        
                        <div id="loginError" class="hidden text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                            ${this.t('wrongPassword')}
                        </div>
                        
                        <button 
                            type="submit"
                            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg"
                        >
                            ${this.t('loginButton')}
                        </button>
                    </form>
                    
                    <p class="text-xs text-gray-500 text-center mt-6">
                        Demo: admin123
                    </p>
                </div>
            </div>
        `;
        
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Language toggle for login screen
        document.getElementById('loginLangViBtn')?.addEventListener('click', () => {
            this.switchLanguage('vi');
        });
        
        document.getElementById('loginLangEnBtn')?.addEventListener('click', () => {
            this.switchLanguage('en');
        });
    }

    handleLogin() {
        const passwordInput = document.getElementById('adminPasswordInput');
        const errorDiv = document.getElementById('loginError');
        
        if (passwordInput.value === this.adminPassword) {
            localStorage.setItem('adminAuthenticated', 'true');
            this.isAuthenticated = true;
            this.showDashboard();
        } else {
            errorDiv.classList.remove('hidden');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    handleLogout() {
        localStorage.removeItem('adminAuthenticated');
        this.isAuthenticated = false;
        this.showLoginScreen();
    }

    showDashboard() {
        const container = document.getElementById('adminContent');
        if (!container) return;
        
        container.innerHTML = `
            <div class="flex h-screen bg-gray-100">
                <!-- Sidebar -->
                <aside class="w-64 bg-gradient-to-b from-blue-900 to-indigo-900 text-white">
                    <div class="p-6">
                        <h1 class="text-2xl font-bold mb-2">🎯 Admin Panel</h1>
                        <p class="text-blue-200 text-sm">DeltaDev Link Manager</p>
                    </div>
                    
                    <nav class="mt-6">
                        <a href="#" data-section="overview" class="sidebar-item active flex items-center px-6 py-3 hover:bg-blue-800 transition-colors">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                            </svg>
                            <span>${this.t('overview')}</span>
                        </a>
                        
                        <a href="#" data-section="orders" class="sidebar-item flex items-center px-6 py-3 hover:bg-blue-800 transition-colors">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                            </svg>
                            <span>${this.t('orders')}</span>
                        </a>
                        
                        <a href="#" data-section="users" class="sidebar-item flex items-center px-6 py-3 hover:bg-blue-800 transition-colors">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                            <span>${this.t('users')}</span>
                        </a>
                        
                        <a href="#" data-section="loyalty" class="sidebar-item flex items-center px-6 py-3 hover:bg-blue-800 transition-colors">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                            </svg>
                            <span>${this.t('loyalty')}</span>
                        </a>
                        
                        <a href="#" data-section="newsletter" class="sidebar-item flex items-center px-6 py-3 hover:bg-blue-800 transition-colors">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            <span>${this.t('newsletter')}</span>
                        </a>
                        
                        <a href="#" data-section="products" class="sidebar-item flex items-center px-6 py-3 hover:bg-blue-800 transition-colors">
                            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                            <span>${this.t('products')}</span>
                        </a>
                    </nav>
                    
                    <div class="absolute bottom-0 w-64 p-6">
                        <button id="adminLogoutBtn" class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                            ${this.t('logout')}
                        </button>
                    </div>
                </aside>
                
                <!-- Main Content -->
                <main class="flex-1 overflow-y-auto">
                    <!-- Header -->
                    <header class="bg-white shadow-sm border-b border-gray-200 p-6">
                        <div class="flex justify-between items-center">
                            <div>
                                <h2 id="sectionTitle" class="text-2xl font-bold text-gray-800">${this.t('overview')}</h2>
                                <p class="text-sm text-gray-500 mt-1">
                                    ${this.currentLanguage === 'vi' ? '⏰ Cập nhật lúc: ' : '⏰ Last updated: '}
                                    <span class="font-semibold">${new Date().toLocaleTimeString(this.currentLanguage === 'vi' ? 'vi-VN' : 'en-US')}</span>
                                </p>
                            </div>
                            <div class="flex items-center gap-3">
                                <!-- Notifications -->
                                <div class="relative">
                                    <button onclick="adminDashboard.showNotificationPanel()" class="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                                        </svg>
                                        <span class="notification-badge">3</span>
                                    </button>
                                </div>
                                
                                <!-- Language Toggle -->
                                <div class="flex items-center bg-gray-100 rounded-lg p-1">
                                    <button id="langViBtn" class="${this.currentLanguage === 'vi' ? 'bg-white shadow-sm' : ''} px-3 py-1.5 rounded-md text-sm font-semibold transition-all" data-lang="vi">
                                        🇻🇳 VI
                                    </button>
                                    <button id="langEnBtn" class="${this.currentLanguage === 'en' ? 'bg-white shadow-sm' : ''} px-3 py-1.5 rounded-md text-sm font-semibold transition-all" data-lang="en">
                                        🇬🇧 EN
                                    </button>
                                </div>
                                
                                <button onclick="adminDashboard.switchSection(adminDashboard.currentSection)" class="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-lg transition-all flex items-center gap-2 font-semibold shadow-sm hover:shadow-md transform hover:scale-105">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                    </svg>
                                    ${this.t('refresh')}
                                </button>
                            </div>
                        </div>
                    </header>
                    
                    <!-- Dynamic Content Area -->
                    <div id="dashboardContent" class="p-6">
                        ${this.renderOverview()}
                    </div>
                </main>
            </div>
        `;
        
        this.attachDashboardEventListeners();
    }

    attachDashboardEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });
        
        // Language toggle buttons
        document.getElementById('langViBtn')?.addEventListener('click', () => {
            this.switchLanguage('vi');
        });
        
        document.getElementById('langEnBtn')?.addEventListener('click', () => {
            this.switchLanguage('en');
        });
        
        // Logout button
        document.getElementById('adminLogoutBtn')?.addEventListener('click', () => {
            this.handleLogout();
        });
    }

    switchSection(section) {
        this.currentSection = section;
        
        // Update active state in sidebar
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active', 'bg-blue-800');
            if (item.dataset.section === section) {
                item.classList.add('active', 'bg-blue-800');
            }
        });
        
        // Update section title
        const titleElement = document.getElementById('sectionTitle');
        if (titleElement) {
            titleElement.textContent = this.t(section);
        }
        
        // Render section content
        const contentElement = document.getElementById('dashboardContent');
        if (contentElement) {
            switch(section) {
                case 'overview':
                    contentElement.innerHTML = this.renderOverview();
                    // Render charts after DOM is ready
                    this.renderSalesChart();
                    this.renderProductChart();
                    break;
                case 'orders':
                    contentElement.innerHTML = this.renderOrders();
                    break;
                case 'users':
                    contentElement.innerHTML = this.renderUsers();
                    break;
                case 'loyalty':
                    contentElement.innerHTML = this.renderLoyalty();
                    break;
                case 'newsletter':
                    contentElement.innerHTML = this.renderNewsletter();
                    break;
                case 'products':
                    contentElement.innerHTML = this.renderProducts();
                    break;
            }
        }
    }

    renderOverview() {
        const stats = this.getStatistics();
        
        return `
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-blue-100 text-sm">${this.t('totalRevenue')}</p>
                            <h3 class="text-3xl font-bold mt-2">${this.formatCurrency(stats.totalRevenue)}</h3>
                        </div>
                        <div class="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                    </div>
                    <p class="text-blue-100 text-sm">+12% so với tháng trước</p>
                </div>
                
                <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-green-100 text-sm">${this.t('totalOrders')}</p>
                            <h3 class="text-3xl font-bold mt-2">${stats.totalOrders}</h3>
                        </div>
                        <div class="bg-green-400 bg-opacity-30 p-3 rounded-lg">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                            </svg>
                        </div>
                    </div>
                    <p class="text-green-100 text-sm">+8% so với tháng trước</p>
                </div>
                
                <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-purple-100 text-sm">${this.t('totalUsers')}</p>
                            <h3 class="text-3xl font-bold mt-2">${stats.totalUsers}</h3>
                        </div>
                        <div class="bg-purple-400 bg-opacity-30 p-3 rounded-lg">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                        </div>
                    </div>
                    <p class="text-purple-100 text-sm">+15% so với tháng trước</p>
                </div>
                
                <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <p class="text-orange-100 text-sm">${this.t('subscribers')}</p>
                            <h3 class="text-3xl font-bold mt-2">${stats.subscribers}</h3>
                        </div>
                        <div class="bg-orange-400 bg-opacity-30 p-3 rounded-lg">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                        </div>
                    </div>
                    <p class="text-orange-100 text-sm">+25% so với tháng trước</p>
                </div>
            </div>
            
            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Sales Chart -->
                <div class="bg-white rounded-xl shadow-md p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">
                            ${this.currentLanguage === 'vi' ? '📈 Biểu đồ Doanh Thu' : '📈 Sales Chart'}
                        </h3>
                        <button onclick="adminDashboard.exportToCSV([{month: 'Jan', revenue: 5200000}], 'sales')" class="text-blue-500 hover:text-blue-700 text-sm font-semibold">
                            ${this.currentLanguage === 'vi' ? 'Xuất CSV' : 'Export CSV'}
                        </button>
                    </div>
                    <div style="height: 300px;">
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>
                
                <!-- Product Distribution Chart -->
                <div class="bg-white rounded-xl shadow-md p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">
                            ${this.currentLanguage === 'vi' ? '🥧 Phân Bố Sản Phẩm' : '🥧 Product Distribution'}
                        </h3>
                        <span class="text-sm text-gray-500">
                            ${this.currentLanguage === 'vi' ? 'Top 5 Bán Chạy' : 'Top 5 Sellers'}
                        </span>
                    </div>
                    <div style="height: 300px;">
                        <canvas id="productChart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions & Activity Log -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <!-- Quick Actions -->
                <div class="bg-white rounded-xl shadow-md p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">
                        ${this.currentLanguage === 'vi' ? '⚡ Thao Tác Nhanh' : '⚡ Quick Actions'}
                    </h3>
                    <div class="space-y-3">
                        <button onclick="adminDashboard.quickActionViewOrders()" class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z"/>
                            </svg>
                            ${this.currentLanguage === 'vi' ? 'Xem Đơn Hàng' : 'View Orders'}
                        </button>
                        
                        <button onclick="adminDashboard.quickActionAddProduct()" class="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                            </svg>
                            ${this.currentLanguage === 'vi' ? 'Thêm Sản Phẩm' : 'Add Product'}
                        </button>
                        
                        <button onclick="adminDashboard.quickActionManageUsers()" class="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                            </svg>
                            ${this.currentLanguage === 'vi' ? 'Quản Lý Users' : 'Manage Users'}
                        </button>
                        
                        <button onclick="adminDashboard.quickActionExportReport()" class="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                            </svg>
                            ${this.currentLanguage === 'vi' ? 'Xuất Báo Cáo' : 'Export Report'}
                        </button>
                    </div>
                </div>
                
                <!-- Activity Log -->
                <div class="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">
                            ${this.currentLanguage === 'vi' ? '📋 Nhật Ký Hoạt Động' : '📋 Activity Log'}
                        </h3>
                        <span class="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            ${this.currentLanguage === 'vi' ? 'Cập nhật tự động' : 'Auto-refresh'}
                        </span>
                    </div>
                    <div class="space-y-2 max-h-[400px] overflow-y-auto">
                        ${this.showActivityLog()}
                    </div>
                </div>
            </div>
            
            <!-- Recent Orders -->
            <div class="bg-white rounded-xl shadow-md p-6 mb-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800">${this.t('recentOrders')}</h3>
                    <button onclick="adminDashboard.switchSection('orders')" class="text-blue-500 hover:text-blue-700 text-sm font-semibold">
                        ${this.currentLanguage === 'vi' ? 'Xem tất cả →' : 'View all →'}
                    </button>
                </div>
                <div class="overflow-x-auto">
                    ${this.renderRecentOrdersTable()}
                </div>
            </div>
            
            <!-- Top Products -->
            <div class="bg-white rounded-xl shadow-md p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800">${this.t('topProducts')}</h3>
                    <button onclick="adminDashboard.switchSection('products')" class="text-blue-500 hover:text-blue-700 text-sm font-semibold">
                        ${this.currentLanguage === 'vi' ? 'Xem tất cả →' : 'View all →'}
                    </button>
                </div>
                <div class="space-y-4">
                    ${this.renderTopProducts()}
                </div>
            </div>
        `;
    }

    renderOrders() {
        const orders = this.getAllOrders();
        
        return `
            <div class="bg-white rounded-xl shadow-md">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 class="text-xl font-bold text-gray-800">${this.t('orderList')}</h3>
                        <div class="flex flex-wrap gap-3">
                            <input type="text" id="orderSearch" placeholder="${this.t('search')} ${this.currentLanguage === 'vi' ? 'đơn hàng...' : 'orders...'}" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" onkeyup="adminDashboard.filterTable('orderSearch', 'orderTable')">
                            <select id="statusFilter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer" onchange="adminDashboard.filterByStatus(this.value)">
                                <option value="">${this.currentLanguage === 'vi' ? 'Tất cả trạng thái' : 'All Status'}</option>
                                <option value="pending">${this.currentLanguage === 'vi' ? 'Chờ xử lý' : 'Pending'}</option>
                                <option value="processing">${this.currentLanguage === 'vi' ? 'Đang xử lý' : 'Processing'}</option>
                                <option value="shipped">${this.currentLanguage === 'vi' ? 'Đang giao' : 'Shipped'}</option>
                                <option value="delivered">${this.currentLanguage === 'vi' ? 'Đã giao' : 'Delivered'}</option>
                            </select>
                            <button onclick="adminDashboard.exportToCSV(adminDashboard.getAllOrders(), 'orders')" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95">
                                📥 ${this.t('export')}
                            </button>
                            <button onclick="adminDashboard.refreshSection()" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold active:scale-95" title="${this.currentLanguage === 'vi' ? 'Làm mới' : 'Refresh'}">
                                🔄
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table id="orderTable" class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('orderId')}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('customer')}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('date')}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('total')}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('status')}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${orders.map(order => this.renderOrderRow(order)).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <div class="p-4 border-t border-gray-200 flex justify-between items-center">
                    <span class="text-sm text-gray-600">
                        ${this.currentLanguage === 'vi' ? `Hiển thị ${orders.length} đơn hàng` : `Showing ${orders.length} orders`}
                    </span>
                    <div class="flex gap-2">
                        <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-semibold">←</button>
                        <button class="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold">1</button>
                        <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-semibold">2</button>
                        <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-semibold">3</button>
                        <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-semibold">→</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderUsers() {
        const users = this.getAllUsers();
        
        return `
            <div class="bg-white rounded-xl shadow-md">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 class="text-xl font-bold text-gray-800">${this.t('userList')}</h3>
                        <div class="flex flex-wrap gap-3">
                            <input type="text" id="userSearch" placeholder="${this.t('search')} ${this.currentLanguage === 'vi' ? 'người dùng...' : 'users...'}" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" onkeyup="adminDashboard.filterTable('userSearch', 'userTable')">
                            <select id="tierFilter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer" onchange="adminDashboard.filterByTier(this.value)">
                                <option value="">${this.currentLanguage === 'vi' ? 'Tất cả hạng' : 'All Tiers'}</option>
                                <option value="platinum">💎 Platinum</option>
                                <option value="gold">🥇 Gold</option>
                                <option value="silver">🥈 Silver</option>
                                <option value="bronze">🥉 Bronze</option>
                            </select>
                            <button onclick="adminDashboard.exportToCSV(adminDashboard.getAllUsers(), 'users')" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105">
                                📅 ${this.t('export')}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table id="userTable" class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('name')}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('email')}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('phone')}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('registered')}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('loyaltyTier')}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('points')}</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${users.map(user => this.renderUserRow(user)).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <div class="p-4 border-t border-gray-200 flex justify-between items-center">
                    <span class="text-sm text-gray-600">
                        ${this.currentLanguage === 'vi' ? `Hiển thị ${users.length} người dùng` : `Showing ${users.length} users`}
                    </span>
                    <div class="flex gap-2">
                        <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-semibold">←</button>
                        <button class="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold">1</button>
                        <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-semibold">→</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderLoyalty() {
        const loyaltyStats = this.getLoyaltyStatistics();
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-white rounded-xl shadow-md p-6">
                    <h4 class="text-gray-600 text-sm mb-2">${this.t('totalPoints')}</h4>
                    <p class="text-3xl font-bold text-blue-600">${loyaltyStats.totalPoints.toLocaleString()}</p>
                </div>
                
                <div class="bg-white rounded-xl shadow-md p-6">
                    <h4 class="text-gray-600 text-sm mb-2">${this.t('pointsRedeemed')}</h4>
                    <p class="text-3xl font-bold text-green-600">${loyaltyStats.pointsRedeemed.toLocaleString()}</p>
                </div>
                
                <div class="bg-white rounded-xl shadow-md p-6">
                    <h4 class="text-gray-600 text-sm mb-2">${this.t('activeMembers')}</h4>
                    <p class="text-3xl font-bold text-purple-600">${loyaltyStats.activeMembers}</p>
                </div>
            </div>
            
            <div class="bg-white rounded-xl shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-800 mb-6">${this.t('tierDistribution')}</h3>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    ${this.renderTierCard('bronze', loyaltyStats.tierCounts.bronze, '🥉')}
                    ${this.renderTierCard('silver', loyaltyStats.tierCounts.silver, '🥈')}
                    ${this.renderTierCard('gold', loyaltyStats.tierCounts.gold, '🥇')}
                    ${this.renderTierCard('platinum', loyaltyStats.tierCounts.platinum, '💎')}
                </div>
            </div>
        `;
    }

    renderNewsletter() {
        const subscribers = this.getNewsletterSubscribers();
        
        return `
            <div class="bg-white rounded-xl shadow-md">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 class="text-xl font-bold text-gray-800">${this.t('newsletterList')}</h3>
                            <p class="text-sm text-gray-600 mt-1">
                                ${this.currentLanguage === 'vi' ? `Tổng cộng: ${subscribers.length} đăng ký` : `Total: ${subscribers.length} subscribers`}
                            </p>
                        </div>
                        <div class="flex flex-wrap gap-3">
                            <input type="text" id="subscriberSearch" placeholder="${this.t('search')} ${this.currentLanguage === 'vi' ? 'email...' : 'email...'}" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" onkeyup="adminDashboard.filterTable('subscriberSearch', 'subscriberTable')">
                            <button onclick="adminDashboard.exportToCSV(adminDashboard.getNewsletterSubscribers().map((email, i) => ({id: i+1, email: email, date: '${new Date().toLocaleDateString('vi-VN')}'})), 'newsletter-subscribers')" class="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                ${this.t('exportList')}
                            </button>
                            <button onclick="adminDashboard.showBulkEmailForm()" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                                ${this.currentLanguage === 'vi' ? 'Gửi Email' : 'Send Email'}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table id="subscriberTable" class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('email')}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('subscribedDate')}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ${this.currentLanguage === 'vi' ? 'Thao tác' : 'Actions'}
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${subscribers.map((email, index) => `
                                <tr class="hover:bg-gray-50 transition-colors">
                                    <td class="px-6 py-4 text-sm text-gray-900 font-semibold">${index + 1}</td>
                                    <td class="px-6 py-4 text-sm text-gray-900">
                                        <div class="flex items-center gap-2">
                                            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                            </svg>
                                            ${email}
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-500">${new Date().toLocaleDateString(this.currentLanguage === 'vi' ? 'vi-VN' : 'en-US')}</td>
                                    <td class="px-6 py-4 text-sm">
                                        <div class="flex gap-2">
                                            <button onclick="adminDashboard.sendEmailToSubscriber('${email}')" class="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium transition-colors">
                                                📧 ${this.currentLanguage === 'vi' ? 'Gửi' : 'Send'}
                                            </button>
                                            <button onclick="adminDashboard.deleteSubscriber('${email}')" class="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <div class="p-4 border-t border-gray-200 flex justify-between items-center">
                    <span class="text-sm text-gray-600">
                        ${this.currentLanguage === 'vi' ? `Hiển thị ${subscribers.length} đăng ký` : `Showing ${subscribers.length} subscribers`}
                    </span>
                    <div class="flex gap-2">
                        <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-semibold">←</button>
                        <button class="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold">1</button>
                        <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-semibold">2</button>
                        <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-semibold">→</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderProducts() {
        const products = this.getProductData();
        
        return `
            <div class="bg-white rounded-xl shadow-md">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 class="text-xl font-bold text-gray-800">${this.t('productList')}</h3>
                        <div class="flex flex-wrap gap-3">
                            <input type="text" id="productSearch" placeholder="${this.t('search')} ${this.currentLanguage === 'vi' ? 'sản phẩm...' : 'products...'}" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" onkeyup="adminDashboard.filterTable('productSearch', 'productTable')">
                            <button onclick="adminDashboard.exportToCSV(adminDashboard.getProductData(), 'products')" class="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105">
                                📥 ${this.t('export')}
                            </button>
                            <button onclick="adminDashboard.showAddProductForm()" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105">
                                ➕ ${this.t('addProduct')}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table id="productTable" class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('productName')}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('price')}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('stock')}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('sold')}</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${this.t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${products.map(product => this.renderProductRow(product)).join('')}
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <div class="p-4 border-t border-gray-200 flex justify-between items-center">
                    <span class="text-sm text-gray-600">
                        ${this.currentLanguage === 'vi' ? `Hiển thị ${products.length} sản phẩm` : `Showing ${products.length} products`}
                    </span>
                    <div class="flex gap-2">
                        <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-semibold">←</button>
                        <button class="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold">1</button>
                        <button class="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-semibold">→</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Helper rendering methods
    renderRecentOrdersTable() {
        const orders = this.getAllOrders().slice(0, 5);
        return `
            <table class="min-w-full">
                <thead>
                    <tr class="text-left text-xs text-gray-500">
                        <th class="pb-3">${this.t('orderId')}</th>
                        <th class="pb-3">${this.t('customer')}</th>
                        <th class="pb-3">${this.t('total')}</th>
                        <th class="pb-3">${this.t('status')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr class="border-t border-gray-100">
                            <td class="py-3 text-sm font-medium">#${order.id}</td>
                            <td class="py-3 text-sm">${order.customer}</td>
                            <td class="py-3 text-sm font-semibold">${this.formatCurrency(order.total)}</td>
                            <td class="py-3">${this.renderStatusBadge(order.status)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderTopProducts() {
        const products = this.getProductData().slice(0, 5);
        return products.map(product => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                        ${product.name.charAt(0)}
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-800">${product.name}</h4>
                        <p class="text-sm text-gray-500">${product.sold} đã bán</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold text-gray-800">${this.formatCurrency(product.price)}</p>
                    <p class="text-sm text-gray-500">${this.t('stock')}: ${product.stock}</p>
                </div>
            </div>
        `).join('');
    }

    renderOrderRow(order) {
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">#${order.id}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${order.customer}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${order.date}</td>
                <td class="px-6 py-4 text-sm font-semibold text-gray-900">${this.formatCurrency(order.total)}</td>
                <td class="px-6 py-4">
                    <select onchange="adminDashboard.updateOrderStatus('${order.id}', this.value)" class="text-sm font-semibold px-3 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'processing' ? 'bg-blue-100 text-blue-800' : order.status === 'shipped' ? 'bg-purple-100 text-purple-800' : order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>${this.currentLanguage === 'vi' ? 'Chờ xử lý' : 'Pending'}</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>${this.currentLanguage === 'vi' ? 'Đang xử lý' : 'Processing'}</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>${this.currentLanguage === 'vi' ? 'Đang giao' : 'Shipped'}</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>${this.currentLanguage === 'vi' ? 'Đã giao' : 'Delivered'}</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>${this.currentLanguage === 'vi' ? 'Đã hủy' : 'Cancelled'}</option>
                    </select>
                </td>
                <td class="px-6 py-4 text-sm">
                    <div class="flex gap-2">
                        <button onclick="alert('Order Details: #${order.id}')" class="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium transition-colors">
                            ${this.currentLanguage === 'vi' ? '👁️ Xem' : '👁️ View'}
                        </button>
                        <button onclick="adminDashboard.exportToCSV([{id: '${order.id}', customer: '${order.customer}', total: ${order.total}}], 'order_${order.id}')" class="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-medium transition-colors">
                            📥
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderUserRow(user) {
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">${user.name}</td>
                <td class="px-6 py-4 text-sm text-gray-900">${user.email}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${user.phone}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${user.registered}</td>
                <td class="px-6 py-4">${this.renderTierBadge(user.tier)}</td>
                <td class="px-6 py-4 text-sm font-semibold text-gray-900">${user.points}</td>
            </tr>
        `;
    }

    renderProductRow(product) {
        return `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">${product.name}</td>
                <td class="px-6 py-4 text-sm font-semibold text-gray-900">${this.formatCurrency(product.price)}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${product.stock} kg</td>
                <td class="px-6 py-4 text-sm text-gray-500">${product.sold}</td>
                <td class="px-6 py-4 text-sm">
                    <div class="flex gap-2">
                        <button onclick="adminDashboard.showEditProductForm('${product.name}')" class="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium transition-colors">
                            ${this.currentLanguage === 'vi' ? '✏️ Sửa' : '✏️ Edit'}
                        </button>
                        <button onclick="adminDashboard.deleteProduct('${product.name}')" class="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors">
                            ${this.currentLanguage === 'vi' ? '🗑️ Xóa' : '🗑️ Delete'}
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderStatusBadge(status) {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return `<span class="px-3 py-1 text-xs font-semibold rounded-full ${colors[status]}">${this.t(status)}</span>`;
    }

    renderTierBadge(tier) {
        const tiers = {
            bronze: { icon: '🥉', color: 'bg-orange-100 text-orange-800' },
            silver: { icon: '🥈', color: 'bg-gray-100 text-gray-800' },
            gold: { icon: '🥇', color: 'bg-yellow-100 text-yellow-800' },
            platinum: { icon: '💎', color: 'bg-purple-100 text-purple-800' }
        };
        const t = tiers[tier] || tiers.bronze;
        return `<span class="tier-badge px-3 py-1 text-xs font-semibold rounded-full ${t.color}">${t.icon} ${this.t(tier)}</span>`;
    }

    renderTierCard(tier, count, icon) {
        return `
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 text-center">
                <div class="text-4xl mb-2">${icon}</div>
                <h4 class="text-lg font-semibold text-gray-800 mb-2">${this.t(tier)}</h4>
                <p class="text-3xl font-bold text-gray-900">${count}</p>
            </div>
        `;
    }

    // Data retrieval methods
    getStatistics() {
        const orders = this.getAllOrders();
        const users = this.getAllUsers();
        const subscribers = this.getNewsletterSubscribers();
        
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        
        return {
            totalRevenue,
            totalOrders: orders.length,
            totalUsers: users.length,
            subscribers: subscribers.length,
            avgOrderValue: totalRevenue / orders.length || 0
        };
    }

    getAllOrders() {
        // Mock data - in production, fetch from backend
        return [
            { id: '20001', customer: 'Nguyễn Văn A', date: '16/02/2026', total: 450000, status: 'delivered' },
            { id: '20002', customer: 'Trần Thị B', date: '16/02/2026', total: 320000, status: 'shipped' },
            { id: '20003', customer: 'Lê Văn C', date: '15/02/2026', total: 780000, status: 'processing' },
            { id: '20004', customer: 'Phạm Thị D', date: '15/02/2026', total: 550000, status: 'delivered' },
            { id: '20005', customer: 'Hoàng Văn E', date: '14/02/2026', total: 920000, status: 'pending' },
            { id: '20006', customer: 'Vũ Thị F', date: '14/02/2026', total: 380000, status: 'delivered' },
            { id: '20007', customer: 'Đỗ Văn G', date: '13/02/2026', total: 640000, status: 'cancelled' }
        ];
    }

    getAllUsers() {
        const userAccounts = JSON.parse(localStorage.getItem('userAccounts') || '[]');
        
        // Return mock data if no users in localStorage
        if (userAccounts.length === 0) {
            return [
                { name: 'Nguyễn Văn An', email: 'nguyenvanan@gmail.com', phone: '0901234567', registered: '15/01/2026', tier: 'platinum', points: 3850 },
                { name: 'Trần Thị Bình', email: 'tranbinhtm@gmail.com', phone: '0912345678', registered: '20/01/2026', tier: 'gold', points: 2450 },
                { name: 'Lê Hoàng Cường', email: 'lehoangcuong@gmail.com', phone: '0923456789', registered: '25/01/2026', tier: 'gold', points: 1980 },
                { name: 'Phạm Thị Dung', email: 'phamthidung@gmail.com', phone: '0934567890', registered: '28/01/2026', tier: 'silver', points: 1250 },
                { name: 'Hoàng Minh Đức', email: 'hoangminhduc@gmail.com', phone: '0945678901', registered: '30/01/2026', tier: 'silver', points: 850 },
                { name: 'Vũ Thị Hương', email: 'vuthihuong@gmail.com', phone: '0956789012', registered: '02/02/2026', tier: 'silver', points: 720 },
                { name: 'Đỗ Văn Khoa', email: 'dovankhoa@gmail.com', phone: '0967890123', registered: '05/02/2026', tier: 'bronze', points: 480 },
                { name: 'Bùi Thị Lan', email: 'buithilan@gmail.com', phone: '0978901234', registered: '08/02/2026', tier: 'bronze', points: 320 },
                { name: 'Mai Quốc Tuấn', email: 'maiquoctuan@gmail.com', phone: '0989012345', registered: '10/02/2026', tier: 'bronze', points: 180 },
                { name: 'Đinh Thị Mai', email: 'dinhthimai@gmail.com', phone: '0990123456', registered: '12/02/2026', tier: 'bronze', points: 95 }
            ];
        }
        
        return userAccounts.map((user, index) => ({
            name: user.name || 'Customer',
            email: user.email,
            phone: user.phone || 'N/A',
            registered: '01/02/2026',
            tier: this.getUserTier(user.email),
            points: this.getUserPoints(user.email)
        }));
    }

    getUserTier(email) {
        const points = this.getUserPoints(email);
        if (points >= 3000) return 'platinum';
        if (points >= 1500) return 'gold';
        if (points >= 500) return 'silver';
        return 'bronze';
    }

    getUserPoints(email) {
        const loyaltyData = JSON.parse(localStorage.getItem(`loyaltyPoints_${email}`) || '{"points": 0}');
        return loyaltyData.points || 0;
    }

    getLoyaltyStatistics() {
        const users = this.getAllUsers();
        const totalPoints = users.reduce((sum, user) => sum + user.points, 0);
        
        const tierCounts = {
            bronze: users.filter(u => u.tier === 'bronze').length,
            silver: users.filter(u => u.tier === 'silver').length,
            gold: users.filter(u => u.tier === 'gold').length,
            platinum: users.filter(u => u.tier === 'platinum').length
        };
        
        return {
            totalPoints,
            pointsRedeemed: 1250, // Mock data
            activeMembers: users.length,
            tierCounts
        };
    }

    getNewsletterSubscribers() {
        const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
        
        // Return mock data if no subscribers in localStorage
        if (subscribers.length === 0) {
            return [
                'contact@deltadevlink.com',
                'marketing@business.vn',
                'hello@startup.vn',
                'info@restaurant.com',
                'nguyenvanan@gmail.com',
                'tranthib@yahoo.com',
                'lehoangc@outlook.com',
                'phamthidung@gmail.com',
                'hoangminhduc123@gmail.com',
                'vuthihuong89@gmail.com',
                'dovankhoa.dev@gmail.com',
                'buithilan2000@yahoo.com',
                'maiquoctuan@hotmail.com',
                'dinhthimai95@gmail.com',
                'customer@food-lover.vn',
                'admin@tasty-bites.com',
                'support@delicious.vn',
                'orders@mekongfood.com',
                'chef@vietnamcuisine.vn',
                'foodie@gourmet.com'
            ];
        }
        
        return subscribers;
    }

    getProductData() {
        const stockData = JSON.parse(localStorage.getItem('productStock') || '{}');
        return [
            { name: 'Savory Chicken Link', price: 180000, stock: stockData['lap-xuong-ga'] || 45, sold: 234 },
            { name: 'Premium Pork Link', price: 210000, stock: stockData['lap-xuong-heo'] || 38, sold: 189 },
            { name: 'Chả lụa', price: 150000, stock: stockData['cha-lua'] || 52, sold: 167 },
            { name: 'Giò thủ', price: 190000, stock: stockData['gio-thu'] || 41, sold: 145 },
            { name: 'Nem chua', price: 120000, stock: stockData['nem-chua'] || 60, sold: 128 },
            { name: 'Hộp quà tặng', price: 320000, stock: stockData['gift-box'] || 28, sold: 95 }
        ];
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    /**
     * Export data to CSV
     */
    exportToCSV(data, filename) {
        const csvContent = this.convertToCSV(data);
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('success', this.currentLanguage === 'vi' ? 'Đã xuất file CSV!' : 'CSV exported!');
    }

    /**
     * Convert array to CSV
     */
    convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [];
        
        // Add headers
        csvRows.push(headers.join(','));
        
        // Add data rows
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                const escaped = ('' + value).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }

    /**
     * Show notification toast
     */
    showNotification(type, message) {
        const notification = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transform transition-all duration-300 translate-x-0`;
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="font-semibold">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    /**
     * Render sales chart using Chart.js
     */
    renderSalesChart() {
        setTimeout(() => {
            const canvas = document.getElementById('salesChart');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            
            // Sample data
            const labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(month => 
                this.currentLanguage === 'vi' ? `Tháng ${month}` : `Month ${month}`
            );
            
            const data = {
                labels: labels,
                datasets: [{
                    label: this.currentLanguage === 'vi' ? 'Doanh thu (VNĐ)' : 'Revenue (VND)',
                    data: [5200000, 6800000, 7500000, 8900000, 9200000, 10500000, 12000000],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            };
            
            new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value.toLocaleString('vi-VN') + 'đ';
                                }
                            }
                        }
                    }
                }
            });
        }, 100);
    }

    /**
     * Render product distribution chart
     */
    renderProductChart() {
        setTimeout(() => {
            const canvas = document.getElementById('productChart');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            
            const data = {
                labels: [
                    this.currentLanguage === 'vi' ? 'Lạp xưởng gà' : 'Savory Chicken Link',
                    this.currentLanguage === 'vi' ? 'Lạp xưởng heo' : 'Premium Pork Link',
                    this.currentLanguage === 'vi' ? 'Chả lụa' : 'Vietnamese Ham',
                    this.currentLanguage === 'vi' ? 'Giò thủ' : 'Vietnamese Pate',
                    this.currentLanguage === 'vi' ? 'Nem chua' : 'Fermented Pork',
                ],
                datasets: [{
                    label: this.currentLanguage === 'vi' ? 'Sản phẩm đã bán' : 'Products Sold',
                    data: [234, 189, 167, 145, 128],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                    ],
                    borderWidth: 0
                }]
            };
            
            new Chart(ctx, {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }, 100);
    }

    /**
     * Update order status
     */
    updateOrderStatus(orderId, newStatus) {
        // In production, this would make an API call
        this.showNotification('success', 
            this.currentLanguage === 'vi' 
                ? `Đã cập nhật trạng thái đơn #${orderId}` 
                : `Order #${orderId} status updated`
        );
        
        // Refresh orders section
        this.switchSection('orders');
    }

    /**
     * Delete product
     */
    deleteProduct(productId) {
        if (confirm(this.currentLanguage === 'vi' ? 'Bạn có chắc muốn xóa sản phẩm này?' : 'Are you sure you want to delete this product?')) {
            this.showNotification('success', 
                this.currentLanguage === 'vi' 
                    ? 'Đã xóa sản phẩm!' 
                    : 'Product deleted!'
            );
            
            // Refresh products section
            this.switchSection('products');
        }
    }

    /**
     * Show activity log
     */
    showActivityLog() {
        const activities = [
            { time: '2 min ago', action: 'Order #20007 created', user: 'Customer', type: 'order' },
            { time: '15 min ago', action: 'Updated order #20003 status', user: 'Admin', type: 'status' },
            { time: '1 hour ago', action: 'New user registered', user: 'user@example.com', type: 'user' },
            { time: '2 hours ago', action: 'Added new product', user: 'Admin', type: 'product' },
            { time: '3 hours ago', action: 'Exported revenue report', user: 'Admin', type: 'export' }
        ];
        
        return activities.map(activity => `
            <div class="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    ${this.getActivityIcon(activity.type)}
                </div>
                <div class="flex-1">
                    <p class="text-sm font-semibold text-gray-800">${activity.action}</p>
                    <p class="text-xs text-gray-500">${activity.user} • ${activity.time}</p>
                </div>
            </div>
        `).join('');
    }

    /**
     * Get activity icon
     */
    getActivityIcon(type) {
        const icons = {
            order: '<svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z"/></svg>',
            status: '<svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
            user: '<svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/></svg>',
            product: '<svg class="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z"/></svg>',
            export: '<svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>'
        };
        return icons[type] || icons.order;
    }

    /**
     * Filter table by search input
     */
    filterTable(inputId, tableId) {
        const input = document.getElementById(inputId);
        const table = document.getElementById(tableId);
        const filter = input.value.toLowerCase();
        const rows = table.getElementsByTagName('tr');
        
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(filter) ? '' : 'none';
        }
    }

    /**
     * Filter orders by status
     */
    filterByStatus(status) {
        const table = document.getElementById('orderTable');
        const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        
        for (let row of rows) {
            if (!status) {
                row.style.display = '';
            } else {
                const select = row.querySelector('select');
                if (select && select.value === status) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        }
    }

    /**
     * Filter users by tier
     */
    filterByTier(tier) {
        const table = document.getElementById('userTable');
        if (!table) return;
        
        const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
        
        for (let row of rows) {
            if (!tier) {
                row.style.display = '';
            } else {
                const tierBadge = row.querySelector('.tier-badge');
                if (tierBadge && tierBadge.textContent.toLowerCase().includes(tier)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        }
    }

    // ==================== MODAL SYSTEM ====================
    showModal(title, content, actions = '', size = 'max-w-4xl') {
        // Remove existing modal if any
        this.closeModal();
        
        const modal = document.createElement('div');
        modal.id = 'adminModal';
        modal.className = 'fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4 animate-fadeIn';
        modal.innerHTML = `
            <div class="${size} w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden animate-slideUp">
                <div class="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <h2 class="text-2xl font-bold text-gray-800">${title}</h2>
                    <button onclick="adminDashboard.closeModal()" class="text-gray-500 hover:text-gray-700 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    ${content}
                </div>
                ${actions ? `
                <div class="p-6 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
                    ${actions}
                </div>
                ` : ''}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on ESC key
        document.addEventListener('keydown', this.handleEscKey);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    closeModal() {
        const modal = document.getElementById('adminModal');
        if (modal) {
            modal.classList.add('animate-fadeOut');
            setTimeout(() => modal.remove(), 200);
        }
        document.removeEventListener('keydown', this.handleEscKey);
    }

    handleEscKey(e) {
        if (e.key === 'Escape') {
            adminDashboard.closeModal();
        }
    }

    // ==================== ORDER DETAILS ====================
    showOrderDetails(orderId) {
        const orders = this.getAllOrders();
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            this.showNotification('error', this.currentLanguage === 'vi' ? 'Không tìm thấy đơn hàng!' : 'Order not found!');
            return;
        }
        
        // Mock order items (in real app, this would come from database)
        const orderItems = [
            { name: 'Heritage Classic Link', quantity: 2, price: 250000, unit: 'kg' },
            { name: 'Spicy Dragon Link', quantity: 1, price: 270000, unit: 'kg' },
            { name: 'Garlic Thunder Link', quantity: 1, price: 260000, unit: 'kg' }
        ];
        
        const content = `
            <div class="space-y-6">
                <!-- Order Info Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">${this.currentLanguage === 'vi' ? 'Mã đơn hàng' : 'Order ID'}</p>
                            <p class="text-lg font-bold text-gray-800">#${order.id}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">${this.currentLanguage === 'vi' ? 'Ngày đặt' : 'Order Date'}</p>
                            <p class="text-lg font-bold text-gray-800">${order.date}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">${this.currentLanguage === 'vi' ? 'Khách hàng' : 'Customer'}</p>
                            <p class="text-lg font-bold text-gray-800">${order.customer}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">${this.currentLanguage === 'vi' ? 'Trạng thái' : 'Status'}</p>
                            <div class="mt-1">${this.renderStatusBadge(order.status)}</div>
                        </div>
                    </div>
                </div>

                <!-- Order Items Table -->
                <div>
                    <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
                        <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                        </svg>
                        ${this.currentLanguage === 'vi' ? 'Sản phẩm đã đặt' : 'Order Items'}
                    </h3>
                    <div class="overflow-hidden border border-gray-200 rounded-xl">
                        <table class="w-full">
                            <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">${this.currentLanguage === 'vi' ? 'Sản phẩm' : 'Product'}</th>
                                    <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">${this.currentLanguage === 'vi' ? 'Số lượng' : 'Quantity'}</th>
                                    <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">${this.currentLanguage === 'vi' ? 'Đơn giá' : 'Unit Price'}</th>
                                    <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">${this.currentLanguage === 'vi' ? 'Thành tiền' : 'Subtotal'}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                ${orderItems.map(item => `
                                    <tr class="hover:bg-gray-50 transition-colors">
                                        <td class="px-4 py-3 text-sm font-medium text-gray-900">${item.name}</td>
                                        <td class="px-4 py-3 text-sm text-gray-600 text-right">${item.quantity} ${item.unit}</td>
                                        <td class="px-4 py-3 text-sm text-gray-600 text-right">${this.formatCurrency(item.price)}</td>
                                        <td class="px-4 py-3 text-sm font-semibold text-gray-900 text-right">${this.formatCurrency(item.price * item.quantity)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot class="bg-gradient-to-r from-amber-50 to-orange-50">
                                <tr>
                                    <td colspan="3" class="px-4 py-4 text-right text-lg font-bold text-gray-800">${this.currentLanguage === 'vi' ? 'Tổng cộng:' : 'Total:'}</td>
                                    <td class="px-4 py-4 text-right text-xl font-bold text-amber-600">${this.formatCurrency(order.total)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <!-- Customer Contact Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-4 bg-gray-50 rounded-xl">
                        <h4 class="font-semibold mb-2 flex items-center gap-2">
                            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            Email
                        </h4>
                        <p class="text-sm text-gray-600">customer@example.com</p>
                    </div>
                    <div class="p-4 bg-gray-50 rounded-xl">
                        <h4 class="font-semibold mb-2 flex items-center gap-2">
                            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                            </svg>
                            ${this.currentLanguage === 'vi' ? 'Điện thoại' : 'Phone'}
                        </h4>
                        <p class="text-sm text-gray-600">+84 xxx-xxx-xxx</p>
                    </div>
                </div>
            </div>
        `;
        
        const actions = `
            <button onclick="adminDashboard.closeModal()" class="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors">
                ${this.currentLanguage === 'vi' ? 'Đóng' : 'Close'}
            </button>
            <button onclick="window.print()" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                ${this.currentLanguage === 'vi' ? 'In hóa đơn' : 'Print Invoice'}
            </button>
        `;
        
        this.showModal(
            this.currentLanguage === 'vi' ? '📦 Chi tiết đơn hàng' : '📦 Order Details',
            content,
            actions
        );
    }

    // ==================== PRODUCT MANAGEMENT ====================
    showEditProductForm(productName) {
        const products = this.getProductData();
        const product = products.find(p => p.name === productName);
        
        if (!product) {
            this.showNotification('error', this.currentLanguage === 'vi' ? 'Không tìm thấy sản phẩm!' : 'Product not found!');
            return;
        }
        
        const content = `
            <form id="productForm" class="space-y-6">
                <input type="hidden" id="originalName" value="${product.name}">
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            ${this.currentLanguage === 'vi' ? 'Tên sản phẩm' : 'Product Name'}
                            <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="productName" value="${product.name}" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            ${this.currentLanguage === 'vi' ? 'Giá (VND)' : 'Price (VND)'}
                            <span class="text-red-500">*</span>
                        </label>
                        <input type="number" id="productPrice" value="${product.price}" min="0" step="1000"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            ${this.currentLanguage === 'vi' ? 'Kho (kg)' : 'Stock (kg)'}
                            <span class="text-red-500">*</span>
                        </label>
                        <input type="number" id="productStock" value="${product.stock}" min="0" step="0.5"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            ${this.currentLanguage === 'vi' ? 'Đã bán (kg)' : 'Sold (kg)'}
                        </label>
                        <input type="number" id="productSold" value="${product.sold}" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            readonly>
                    </div>
                </div>
                
                <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p class="text-sm text-amber-800">
                        <strong>${this.currentLanguage === 'vi' ? '💡 Lưu ý:' : '💡 Note:'}</strong>
                        ${this.currentLanguage === 'vi' 
                            ? 'Thay đổi sẽ được lưu vào localStorage của Admin Dashboard.' 
                            : 'Changes will be saved to Admin Dashboard localStorage.'}
                    </p>
                </div>
            </form>
        `;
        
        const actions = `
            <button onclick="adminDashboard.closeModal()" class="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors">
                ${this.currentLanguage === 'vi' ? 'Hủy' : 'Cancel'}
            </button>
            <button onclick="adminDashboard.saveProduct(false)" class="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg">
                ${this.currentLanguage === 'vi' ? '💾 Lưu thay đổi' : '💾 Save Changes'}
            </button>
        `;
        
        this.showModal(
            this.currentLanguage === 'vi' ? '✏️ Chỉnh sửa sản phẩm' : '✏️ Edit Product',
            content,
            actions
        );
    }

    showAddProductForm() {
        const content = `
            <form id="productForm" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            ${this.currentLanguage === 'vi' ? 'Tên sản phẩm' : 'Product Name'}
                            <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="productName" placeholder="${this.currentLanguage === 'vi' ? 'VD: Premium Golden Link' : 'e.g., Premium Golden Link'}"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            ${this.currentLanguage === 'vi' ? 'Giá (VND)' : 'Price (VND)'}
                            <span class="text-red-500">*</span>
                        </label>
                        <input type="number" id="productPrice" placeholder="250000" min="0" step="1000"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            ${this.currentLanguage === 'vi' ? 'Kho (kg)' : 'Stock (kg)'}
                            <span class="text-red-500">*</span>
                        </label>
                        <input type="number" id="productStock" placeholder="100" min="0" step="0.5"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            ${this.currentLanguage === 'vi' ? 'Đã bán (kg)' : 'Sold (kg)'}
                        </label>
                        <input type="number" id="productSold" value="0" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                            readonly>
                    </div>
                </div>
                
                <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p class="text-sm text-blue-800">
                        <strong>${this.currentLanguage === 'vi' ? '✨ Tip:' : '✨ Tip:'}</strong>
                        ${this.currentLanguage === 'vi' 
                            ? 'Sản phẩm mới sẽ xuất hiện trong danh sách Products của Admin Dashboard.' 
                            : 'New product will appear in the Admin Dashboard Products list.'}
                    </p>
                </div>
            </form>
        `;
        
        const actions = `
            <button onclick="adminDashboard.closeModal()" class="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors">
                ${this.currentLanguage === 'vi' ? 'Hủy' : 'Cancel'}
            </button>
            <button onclick="adminDashboard.saveProduct(true)" class="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg">
                ${this.currentLanguage === 'vi' ? '➕ Thêm sản phẩm' : '➕ Add Product'}
            </button>
        `;
        
        this.showModal(
            this.currentLanguage === 'vi' ? '✨ Thêm sản phẩm mới' : '✨ Add New Product',
            content,
            actions
        );
    }

    saveProduct(isNew = false) {
        const name = document.getElementById('productName').value.trim();
        const price = parseFloat(document.getElementById('productPrice').value);
        const stock = parseFloat(document.getElementById('productStock').value);
        const sold = parseFloat(document.getElementById('productSold').value) || 0;
        
        if (!name || !price || stock < 0) {
            this.showNotification('error', this.currentLanguage === 'vi' ? 'Vui lòng điền đầy đủ thông tin!' : 'Please fill in all required fields!');
            return;
        }
        
        let products = this.getProductData();
        
        if (isNew) {
            // Check if product already exists
            if (products.find(p => p.name.toLowerCase() === name.toLowerCase())) {
                this.showNotification('error', this.currentLanguage === 'vi' ? 'Sản phẩm đã tồn tại!' : 'Product already exists!');
                return;
            }
            
            // Add new product
            products.push({ name, price, stock, sold });
            this.showNotification('success', this.currentLanguage === 'vi' ? `✅ Đã thêm "${name}"!` : `✅ Added "${name}"!`);
        } else {
            // Update existing product
            const originalName = document.getElementById('originalName').value;
            const productIndex = products.findIndex(p => p.name === originalName);
            
            if (productIndex !== -1) {
                products[productIndex] = { name, price, stock, sold };
                this.showNotification('success', this.currentLanguage === 'vi' ? `✅ Đã cập nhật "${name}"!` : `✅ Updated "${name}"!`);
            }
        }
        
        // Save to localStorage
        localStorage.setItem('adminProducts', JSON.stringify(products));
        
        // Close modal and refresh
        this.closeModal();
        this.switchSection('products');
    }

    deleteProduct(productName) {
        if (!confirm(this.currentLanguage === 'vi' 
            ? `Xóa sản phẩm "${productName}"?` 
            : `Delete product "${productName}"?`)) {
            return;
        }
        
        let products = this.getProductData();
        products = products.filter(p => p.name !== productName);
        
        localStorage.setItem('adminProducts', JSON.stringify(products));
        this.showNotification('success', this.currentLanguage === 'vi' ? '✅ Đã xóa sản phẩm!' : '✅ Product deleted!');
        
        this.switchSection('products');
    }

    // ==================== EMAIL & NEWSLETTER ====================
    sendEmailToSubscriber(email) {
        const subject = this.currentLanguage === 'vi' 
            ? 'Newsletter từ DeltaDev Link' 
            : 'Newsletter from DeltaDev Link';
        
        const body = this.currentLanguage === 'vi'
            ? 'Xin chào!\n\nCảm ơn bạn đã đăng ký newsletter của DeltaDev Link.\n\nTrân trọng,\nDeltaDev Link Team'
            : 'Hello!\n\nThank you for subscribing to DeltaDev Link newsletter.\n\nBest regards,\nDeltaDev Link Team';
        
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    showBulkEmailForm() {
        const subscribers = this.getNewsletterSubscribers();
        const emailList = subscribers.join(', ');
        
        const content = `
            <div class="space-y-6">
                <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p class="text-sm text-blue-800">
                        <strong>📧 ${this.currentLanguage === 'vi' ? 'Gửi đến:' : 'Send to:'}</strong>
                        ${subscribers.length} ${this.currentLanguage === 'vi' ? 'người đăng ký' : 'subscribers'}
                    </p>
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        ${this.currentLanguage === 'vi' ? 'Tiêu đề email' : 'Email Subject'}
                    </label>
                    <input type="text" id="emailSubject" 
                        value="${this.currentLanguage === 'vi' ? 'Newsletter từ DeltaDev Link' : 'Newsletter from DeltaDev Link'}"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">
                        ${this.currentLanguage === 'vi' ? 'Nội dung email' : 'Email Content'}
                    </label>
                    <textarea id="emailBody" rows="8" 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="${this.currentLanguage === 'vi' ? 'Nhập nội dung email...' : 'Enter email content...'}">${this.currentLanguage === 'vi' 
                            ? 'Xin chào quý khách!\n\nChúc mừng năm mới! DeltaDev Link xin gửi đến bạn chương trình ưu đãi đặc biệt...\n\nTrân trọng,\nDeltaDev Link Team'
                            : 'Hello valued customer!\n\nHappy New Year! DeltaDev Link presents special offers for you...\n\nBest regards,\nDeltaDev Link Team'}</textarea>
                </div>
                
                <div class="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p class="text-sm text-amber-800">
                        <strong>${this.currentLanguage === 'vi' ? '⚠️ Lưu ý:' : '⚠️ Note:'}</strong>
                        ${this.currentLanguage === 'vi' 
                            ? 'Email sẽ được mở bằng ứng dụng email mặc định của bạn. Để gửi email hàng loạt thực sự, cần tích hợp với dịch vụ email (SendGrid, Mailchimp, etc).' 
                            : 'Email will be opened in your default email client. For real bulk sending, integration with email service (SendGrid, Mailchimp, etc) is required.'}
                    </p>
                </div>
            </div>
        `;
        
        const actions = `
            <button onclick="adminDashboard.closeModal()" class="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors">
                ${this.currentLanguage === 'vi' ? 'Hủy' : 'Cancel'}
            </button>
            <button onclick="adminDashboard.sendBulkEmail()" class="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg">
                📧 ${this.currentLanguage === 'vi' ? 'Gửi Email' : 'Send Email'}
            </button>
        `;
        
        this.showModal(
            this.currentLanguage === 'vi' ? '📨 Gửi Email Hàng Loạt' : '📨 Send Bulk Email',
            content,
            actions,
            'max-w-3xl'
        );
    }

    sendBulkEmail() {
        const subject = document.getElementById('emailSubject').value;
        const body = document.getElementById('emailBody').value;
        const subscribers = this.getNewsletterSubscribers();
        
        // Open mailto with BCC (for privacy)
        window.location.href = `mailto:?bcc=${subscribers.join(',')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        this.showNotification('success', 
            this.currentLanguage === 'vi' 
                ? `✅ Đã mở email client với ${subscribers.length} người nhận!` 
                : `✅ Email client opened with ${subscribers.length} recipients!`
        );
        
        this.closeModal();
    }

    deleteSubscriber(email) {
        if (!confirm(this.currentLanguage === 'vi' 
            ? `Xóa subscriber "${email}"?` 
            : `Remove subscriber "${email}"?`)) {
            return;
        }
        
        let subscribers = this.getNewsletterSubscribers();
        subscribers = subscribers.filter(e => e !== email);
        
        localStorage.setItem('adminNewsletter', JSON.stringify(subscribers));
        this.showNotification('success', this.currentLanguage === 'vi' ? '✅ Đã xóa!' : '✅ Removed!');
        
        this.switchSection('newsletter');
    }

    // ==================== NOTIFICATIONS ====================
    showNotificationPanel() {
        // Remove existing panel if any
        this.closeNotificationPanel();
        
        const notifications = [
            {
                icon: '🛒',
                title: this.currentLanguage === 'vi' ? 'Đơn hàng mới #20007' : 'New order #20007',
                message: this.currentLanguage === 'vi' ? 'Nguyễn Văn A vừa đặt đơn hàng' : 'Nguyen Van A placed an order',
                time: '5 phút trước',
                type: 'success'
            },
            {
                icon: '⚠️',
                title: this.currentLanguage === 'vi' ? 'Sản phẩm sắp hết' : 'Low stock alert',
                message: 'Heritage Classic Link: ' + (this.currentLanguage === 'vi' ? 'Còn 12kg' : 'Only 12kg left'),
                time: '1 giờ trước',
                type: 'warning'
            },
            {
                icon: '👤',
                title: this.currentLanguage === 'vi' ? 'Người dùng mới' : 'New user',
                message: this.currentLanguage === 'vi' ? 'Trần Thị B vừa đăng ký' : 'Tran Thi B just registered',
                time: '2 giờ trước',
                type: 'info'
            },
            {
                icon: '📧',
                title: this.currentLanguage === 'vi' ? 'Newsletter mới' : 'New subscriber',
                message: this.currentLanguage === 'vi' ? '3 người đăng ký mới' : '3 new subscribers',
                time: '3 giờ trước',
                type: 'info'
            },
            {
                icon: '✅',
                title: this.currentLanguage === 'vi' ? 'Đơn hàng hoàn thành' : 'Order completed',
                message: this.currentLanguage === 'vi' ? 'Đơn #20005 đã giao thành công' : 'Order #20005 delivered',
                time: '5 giờ trước',
                type: 'success'
            }
        ];
        
        const panel = document.createElement('div');
        panel.id = 'notificationPanel';
        panel.className = 'absolute top-full right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9998] animate-slideDown';
        panel.innerHTML = `
            <div class="p-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
                <div class="flex items-center justify-between">
                    <h3 class="font-bold text-lg text-gray-800">
                        🔔 ${this.currentLanguage === 'vi' ? 'Thông báo' : 'Notifications'}
                    </h3>
                    <button onclick="adminDashboard.closeNotificationPanel()" class="text-gray-500 hover:text-gray-700">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="max-h-96 overflow-y-auto">
                ${notifications.map(notif => `
                    <div class="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div class="flex items-start gap-3">
                            <span class="text-2xl">${notif.icon}</span>
                            <div class="flex-1">
                                <h4 class="font-semibold text-sm text-gray-800">${notif.title}</h4>
                                <p class="text-sm text-gray-600 mt-1">${notif.message}</p>
                                <span class="text-xs text-gray-400 mt-1 block">${notif.time}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="p-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <button onclick="adminDashboard.clearAllNotifications()" class="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                    ${this.currentLanguage === 'vi' ? 'Xóa tất cả' : 'Clear all'}
                </button>
            </div>
        `;
        
        // Find the notification button's parent to position the panel
        const notifButton = document.querySelector('button[onclick*="showNotificationPanel"]');
        if (notifButton && notifButton.parentElement) {
            notifButton.parentElement.style.position = 'relative';
            notifButton.parentElement.appendChild(panel);
            
            // Close on click outside
            setTimeout(() => {
                document.addEventListener('click', this.handleClickOutsideNotification);
            }, 100);
        }
    }

    closeNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.remove();
        }
        document.removeEventListener('click', this.handleClickOutsideNotification);
    }

    handleClickOutsideNotification(e) {
        const panel = document.getElementById('notificationPanel');
        const button = document.querySelector('button[onclick*="showNotificationPanel"]');
        
        if (panel && !panel.contains(e.target) && !button.contains(e.target)) {
            adminDashboard.closeNotificationPanel();
        }
    }

    clearAllNotifications() {
        this.showNotification('success', 
            this.currentLanguage === 'vi' ? '✅ Đã xóa tất cả thông báo!' : '✅ All notifications cleared!'
        );
        this.closeNotificationPanel();
    }

    // ==================== QUICK ACTIONS ====================
    quickActionViewOrders() {
        this.switchSection('orders');
        this.showNotification('info', 
            this.currentLanguage === 'vi' ? '📦 Đã chuyển đến trang Đơn Hàng' : '📦 Switched to Orders'
        );
    }

    quickActionAddProduct() {
        this.showAddProductForm();
    }

    quickActionManageUsers() {
        this.switchSection('users');
        this.showNotification('info', 
            this.currentLanguage === 'vi' ? '👥 Đã chuyển đến trang Users' : '👥 Switched to Users'
        );
    }

    quickActionExportReport() {
        const stats = this.getStatistics();
        const reportData = [
            {
                metric: 'Total Orders',
                value: stats.totalOrders || 0
            },
            {
                metric: 'Total Revenue',
                value: stats.totalRevenue ? this.formatCurrency(stats.totalRevenue) : '0đ'
            },
            {
                metric: 'Total Users',
                value: stats.totalUsers || 0
            },
            {
                metric: 'Newsletter Subscribers',
                value: stats.newsletterSubscribers || 0
            }
        ];
        
        this.exportToCSV(reportData, 'overview-report');
        this.showNotification('success', 
            this.currentLanguage === 'vi' ? '✅ Đã xuất báo cáo tổng quan!' : '✅ Overview report exported!'
        );
    }

    refreshSection() {
        this.showNotification('info', 
            this.currentLanguage === 'vi' ? '🔄 Đang làm mới...' : '🔄 Refreshing...'
        );
        
        // Reload current section
        setTimeout(() => {
            this.switchSection(this.currentSection);
            this.showNotification('success', 
                this.currentLanguage === 'vi' ? '✅ Đã làm mới!' : '✅ Refreshed!'
            );
        }, 300);
    }

    switchLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('adminLanguage', lang);
        this.appState.set('currentLanguage', lang);
        
        // Refresh the entire dashboard
        if (this.isAuthenticated) {
            this.showDashboard();
        } else {
            this.showLoginScreen();
        }
    }

    setupEventListeners() {
        // Load saved language preference
        const savedLang = localStorage.getItem('adminLanguage');
        if (savedLang) {
            this.currentLanguage = savedLang;
            this.appState.set('currentLanguage', savedLang);
        }
        
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            if (this.isAuthenticated) {
                this.showDashboard();
            } else {
                this.showLoginScreen();
            }
        });
    }
}
