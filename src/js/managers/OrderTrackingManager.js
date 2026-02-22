/**
 * Order Tracking Manager
 * Handles order tracking and order history functionality
 * @module managers/OrderTrackingManager
 */

export class OrderTrackingManager {
    constructor(appState, config) {
        this.appState = appState;
        this.config = config;
        this.orders = [];
        this.modal = null;
        this.currentLanguage = 'vi';
        
        // Translation dictionary
        this.translations = {
            vi: {
                trackOrder: 'Tra cứu đơn hàng',
                orderTracking: 'Tra cứu đơn hàng',
                findYourOrder: 'Tìm đơn hàng của bạn',
                orderId: 'Mã đơn hàng',
                phoneNumber: 'Số điện thoại',
                searchOrder: 'Tìm kiếm',
                recentOrders: 'Đơn hàng gần đây',
                products: 'sản phẩm',
                orderStatus: 'Trạng thái đơn hàng',
                orderTimeline: 'Trạng thái đơn hàng',
                customer: 'Khách hàng',
                trackingNumber: 'Mã vận đơn',
                orderDate: 'Đặt ngày',
                total: 'Tổng cộng',
                quantity: 'Số lượng',
                contactSupport: 'Liên hệ hỗ trợ',
                orderAgain: 'Đặt lại',
                backToSearch: 'Quay lại tìm kiếm',
                noOrders: 'Chưa có đơn hàng',
                confirmed: 'Đã xác nhận',
                processing: 'Đang xử lý',
                shipped: 'Đang vận chuyển',
                delivered: 'Đã giao hàng',
                cancelled: 'Đã huỷ'
            },
            en: {
                trackOrder: 'Track Order',
                orderTracking: 'Order Tracking',
                findYourOrder: 'Find Your Order',
                orderId: 'Order ID',
                phoneNumber: 'Phone Number',
                searchOrder: 'Search Order',
                recentOrders: 'Recent Orders',
                products: 'products',
                orderStatus: 'Order Status',
                orderTimeline: 'Order Timeline',
                customer: 'Customer',
                trackingNumber: 'Tracking Number',
                orderDate: 'Order Date',
                total: 'Total',
                quantity: 'Quantity',
                contactSupport: 'Contact Support',
                orderAgain: 'Order Again',
                backToSearch: 'Back to Search',
                noOrders: 'No orders found',
                confirmed: 'Confirmed',
                processing: 'Processing',
                shipped: 'Shipped',
                delivered: 'Delivered',
                cancelled: 'Cancelled'
            }
        };
    }

    /**
     * Initialize order tracking manager
     */
    init() {
        console.log('[OrderTrackingManager] Initializing...');
        
        this.currentLanguage = this.appState.get('currentLanguage') || 'vi';
        this.loadOrders();
        this.createTrackingModal();
        this.attachEventListeners();
        this.addTrackingLink();
        
        // Listen for language changes
        document.addEventListener('languageChanged', (e) => {
            this.currentLanguage = e.detail.language;
            this.updateLanguage();
        });
        
        console.log('[OrderTrackingManager] Initialized with', this.orders.length, 'orders');
    }
    
    /**
     * Get translation
     */
    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }
    
    /**
     * Update language for all dynamic content
     */
    updateLanguage() {
        // Update tracking button text if exists
        const trackBtn = document.getElementById('trackOrderButton');
        if (trackBtn) {
            const span = trackBtn.querySelector('span');
            if (span && !span.hasAttribute('data-en')) {
                span.textContent = this.t('trackOrder');
            }
        }
        
        // Re-render if modal is open
        if (this.modal && !this.modal.classList.contains('hidden')) {
            // Check if showing order details or list
            const detailsDiv = document.getElementById('orderDetails');
            if (detailsDiv && !detailsDiv.classList.contains('hidden')) {
                // Find current order and re-render
                const orderId = detailsDiv.querySelector('h3')?.textContent?.match(/LP\d+/)?.[0];
                if (orderId) {
                    const order = this.orders.find(o => o.id === orderId);
                    if (order) this.displayOrderDetails(order);
                }
            } else {
                this.renderOrderHistory();
            }
        }
    }

    /**
     * Load orders from localStorage
     */
    loadOrders() {
        try {
            const saved = localStorage.getItem('orderHistory');
            this.orders = saved ? JSON.parse(saved) : this.generateMockOrders();
            
            // If no orders, generate some mock data for demo
            if (this.orders.length === 0) {
                this.orders = this.generateMockOrders();
                this.saveOrders();
            }
        } catch (error) {
            console.error('[OrderTrackingManager] Failed to load orders:', error);
            this.orders = this.generateMockOrders();
        }
    }

    /**
     * Generate mock orders for demo
     */
    generateMockOrders() {
        const now = new Date();
        return [
            {
                id: 'LP' + Date.now().toString().slice(-8),
                customerName: 'Nguyễn Văn A',
                phone: '0901234567',
                email: 'nguyenvana@email.com',
                products: [
                    { name: 'Heritage Classic Link', quantity: 2, price: 190000 }
                ],
                total: 380000,
                status: 'delivered',
                statusText: 'Đã giao hàng',
                notes: 'Giao hàng thành công',
                orderDate: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
                trackingNumber: 'VNP' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                timeline: [
                    { status: 'confirmed', date: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(), title: 'Đơn hàng đã xác nhận' },
                    { status: 'processing', date: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(), title: 'Đang chuẩn bị hàng' },
                    { status: 'shipped', date: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(), title: 'Đã giao cho đơn vị vận chuyển' },
                    { status: 'delivered', date: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(), title: 'Đã giao hàng thành công' }
                ]
            },
            {
                id: 'LP' + (Date.now() - 1000000).toString().slice(-8),
                customerName: 'Trần Thị B',
                phone: '0987654321',
                email: 'tranthib@email.com',
                products: [
                    { name: 'DeltaDev Link Gift Set', quantity: 1, price: 205000 }
                ],
                total: 205000,
                status: 'shipped',
                statusText: 'Đang vận chuyển',
                notes: 'Dự kiến giao hàng trong 1-2 ngày',
                orderDate: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
                trackingNumber: 'VNP' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                timeline: [
                    { status: 'confirmed', date: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(), title: 'Đơn hàng đã xác nhận' },
                    { status: 'processing', date: new Date(now - 1.5 * 24 * 60 * 60 * 1000).toISOString(), title: 'Đang chuẩn bị hàng' },
                    { status: 'shipped', date: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(), title: 'Đã giao cho đơn vị vận chuyển' }
                ]
            },
            {
                id: 'LP' + (Date.now() - 2000000).toString().slice(-8),
                customerName: 'Lê Văn C',
                phone: '0912345678',
                email: 'levanc@email.com',
                products: [
                    { name: 'Lean Premium Link', quantity: 3, price: 220000 }
                ],
                total: 660000,
                status: 'processing',
                statusText: 'Đang xử lý',
                notes: 'Đơn hàng đang được chuẩn bị',
                orderDate: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(),
                trackingNumber: 'VNP' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                timeline: [
                    { status: 'confirmed', date: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString(), title: 'Đơn hàng đã xác nhận' },
                    { status: 'processing', date: new Date(now - 0.5 * 24 * 60 * 60 * 1000).toISOString(), title: 'Đang chuẩn bị hàng' }
                ]
            }
        ];
    }

    /**
     * Save orders to localStorage
     */
    saveOrders() {
        try {
            localStorage.setItem('orderHistory', JSON.stringify(this.orders));
        } catch (error) {
            console.error('[OrderTrackingManager] Failed to save orders:', error);
        }
    }

    /**
     * Add order tracking link to footer
     */
    addTrackingLink() {
        const footer = document.querySelector('footer');
        if (footer) {
            const trackBtn = document.createElement('button');
            trackBtn.id = 'trackOrderButton';
            trackBtn.className = 'fixed bottom-24 left-6 bg-primary text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition z-50 flex items-center gap-2 text-sm';
            trackBtn.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
                <span data-en="Track Order" data-vi="Tra cứu đơn hàng">Tra cứu đơn hàng</span>
            `;
            document.body.appendChild(trackBtn);
        }
    }

    /**
     * Create tracking modal
     */
    createTrackingModal() {
        const modal = document.createElement('div');
        modal.id = 'orderTrackingModal';
        modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm hidden z-[100] flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                <!-- Close Button -->
                <button id="closeTrackingModal" class="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition z-10">
                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>

                <!-- Tracking Content -->
                <div class="p-6 md:p-8">
                    <h2 class="text-3xl font-bold mb-6 flex items-center gap-2">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                        </svg>
                        <span data-en="Order Tracking" data-vi="Tra cứu đơn hàng">Tra cứu đơn hàng</span>
                    </h2>
                    
                    <!-- Search Form -->
                    <div id="trackingSearchForm" class="mb-8">
                        <div class="bg-gray-50 rounded-2xl p-6">
                            <h3 class="text-lg font-semibold mb-4" data-en="Find Your Order" data-vi="Tìm đơn hàng của bạn">Tìm đơn hàng của bạn</h3>
                            <form id="orderSearchForm" class="space-y-4">
                                <div class="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label for="searchOrderId" class="block text-sm font-semibold mb-2" data-en="Order ID" data-vi="Mã đơn hàng">Mã đơn hàng</label>
                                        <input type="text" id="searchOrderId" 
                                               class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                                               placeholder="LP12345678">
                                    </div>
                                    <div>
                                        <label for="searchPhone" class="block text-sm font-semibold mb-2" data-en="Phone Number" data-vi="Số điện thoại">Số điện thoại</label>
                                        <input type="tel" id="searchPhone" 
                                               class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                                               placeholder="0901234567">
                                    </div>
                                </div>
                                <button type="submit" class="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-semibold">
                                    <span data-en="Search Order" data-vi="Tìm kiếm">Tìm kiếm</span>
                                </button>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Order Details -->
                    <div id="orderDetails" class="hidden">
                        <!-- Order details will be injected here -->
                    </div>
                    
                    <!-- Order History -->
                    <div id="orderHistory">
                        <h3 class="text-2xl font-bold mb-4" data-en="Recent Orders" data-vi="Đơn hàng gần đây">Đơn hàng gần đây</h3>
                        <div id="ordersList" class="space-y-3">
                            <!-- Orders will be injected here -->
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
        // Open tracking modal
        document.getElementById('trackOrderButton')?.addEventListener('click', () => this.openModal());
        
        // Close modal
        document.getElementById('closeTrackingModal')?.addEventListener('click', () => this.closeModal());
        
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal?.classList.contains('hidden')) {
                this.closeModal();
            }
        });
        
        // Search form
        document.getElementById('orderSearchForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.searchOrder();
        });
        
        // Listen for new orders from checkout
        document.addEventListener('orderPlaced', (e) => {
            this.addOrder(e.detail);
        });
    }

    /**
     * Search order
     */
    searchOrder() {
        const orderId = document.getElementById('searchOrderId')?.value.trim();
        const phone = document.getElementById('searchPhone')?.value.trim();
        
        if (!orderId && !phone) {
            this.showNotification('error', 'Vui lòng nhập mã đơn hàng hoặc số điện thoại');
            return;
        }
        
        let order = null;
        
        if (orderId) {
            order = this.orders.find(o => o.id.toLowerCase() === orderId.toLowerCase());
        } else if (phone) {
            order = this.orders.find(o => o.phone === phone);
        }
        
        if (order) {
            this.displayOrderDetails(order);
        } else {
            this.showNotification('error', 'Không tìm thấy đơn hàng. Vui lòng kiểm tra lại thông tin.');
        }
    }

    /**
     * Display order details
     */
    displayOrderDetails(order) {
        const detailsDiv = document.getElementById('orderDetails');
        const searchForm = document.getElementById('trackingSearchForm');
        const historyDiv = document.getElementById('orderHistory');
        
        if (!detailsDiv) return;
        
        searchForm?.classList.add('hidden');
        historyDiv?.classList.add('hidden');
        
        const statusColors = {
            confirmed: 'bg-blue-100 text-blue-700',
            processing: 'bg-yellow-100 text-yellow-700',
            shipped: 'bg-purple-100 text-purple-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        
        const statusIcons = {
            confirmed: '✓',
            processing: '⏳',
            shipped: '🚚',
            delivered: '✅',
            cancelled: '❌'
        };
        
        detailsDiv.innerHTML = `
            <button id="backToSearch" class="mb-4 text-primary hover:underline flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                <span data-en="Back to Search" data-vi="Quay lại tìm kiếm">${this.t('backToSearch')}</span>
            </button>
            
            <div class="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 mb-6">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="text-2xl font-bold mb-2">${this.currentLanguage === 'vi' ? 'Đơn hàng' : 'Order'} #${order.id}</h3>
                        <p class="text-gray-600">${this.t('orderDate')}: ${this.formatDate(order.orderDate)}</p>
                    </div>
                    <div class="text-right">
                        <span class="inline-block px-4 py-2 ${statusColors[order.status]} rounded-full font-semibold">
                            ${statusIcons[order.status]} ${this.t(order.status)}
                        </span>
                    </div>
                </div>
                
                <div class="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <p class="text-sm text-gray-600 mb-1">${this.t('customer')}</p>
                        <p class="font-semibold">${order.customerName}</p>
                        <p class="text-sm">${order.phone}</p>
                        <p class="text-sm text-gray-600">${order.email}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600 mb-1">${this.t('trackingNumber')}</p>
                        <p class="font-mono font-semibold">${order.trackingNumber}</p>
                        <p class="text-sm text-gray-600 mt-2">${order.notes}</p>
                    </div>
                </div>
            </div>
            
            <!-- Order Timeline -->
            <div class="mb-6">
                <h4 class="text-lg font-bold mb-4" data-en="Order Timeline" data-vi="Trạng thái đơn hàng">${this.t('orderTimeline')}</h4>
                <div class="relative">
                    <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div class="space-y-6">
                        ${order.timeline.map((event, index) => `
                            <div class="relative flex items-start gap-4">
                                <div class="w-12 h-12 rounded-full ${statusColors[event.status]} flex items-center justify-center font-bold text-lg z-10">
                                    ${statusIcons[event.status]}
                                </div>
                                <div class="flex-1 pt-2">
                                    <h5 class="font-semibold">${event.title}</h5>
                                    <p class="text-sm text-gray-500">${this.formatDateTime(event.date)}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <!-- Order Items -->
            <div class="border-t border-gray-200 pt-6">
                <h4 class="text-lg font-bold mb-4" data-en="Order Items" data-vi="Sản phẩm">${this.currentLanguage === 'vi' ? 'Sản phẩm' : 'Order Items'}</h4>
                <div class="space-y-3">
                    ${order.products.map(product => `
                        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <h5 class="font-semibold">${product.name}</h5>
                                <p class="text-sm text-gray-600">${this.t('quantity')}: ${product.quantity} kg</p>
                            </div>
                            <div class="text-right">
                                <p class="font-bold text-primary">${this.formatPrice(product.price * product.quantity)}</p>
                                <p class="text-sm text-gray-500">${this.formatPrice(product.price)}/kg</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="mt-6 pt-4 border-t border-gray-200">
                    <div class="flex items-center justify-between text-xl font-bold">
                        <span data-en="Total" data-vi="Tổng cộng">${this.t('total')}</span>
                        <span class="text-primary">${this.formatPrice(order.total)}</span>
                    </div>
                </div>
            </div>
            
            <div class="mt-6 flex gap-3">
                <button class="flex-1 py-3 border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition font-semibold">
                    <span data-en="Contact Support" data-vi="Liên hệ hỗ trợ">${this.t('contactSupport')}</span>
                </button>
                <button class="flex-1 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition font-semibold">
                    <span data-en="Order Again" data-vi="Đặt lại">${this.t('orderAgain')}</span>
                </button>
            </div>
        `;
        
        detailsDiv.classList.remove('hidden');
        
        // Back button
        document.getElementById('backToSearch')?.addEventListener('click', () => {
            detailsDiv.classList.add('hidden');
            searchForm?.classList.remove('hidden');
            historyDiv?.classList.remove('hidden');
        });
    }

    /**
     * Add new order
     */
    addOrder(orderData) {
        this.orders.unshift(orderData);
        this.saveOrders();
        this.renderOrderHistory();
    }

    /**
     * Open modal
     */
    openModal() {
        this.renderOrderHistory();
        this.modal?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close modal
     */
    closeModal() {
        this.modal?.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Reset view
        document.getElementById('orderDetails')?.classList.add('hidden');
        document.getElementById('trackingSearchForm')?.classList.remove('hidden');
        document.getElementById('orderHistory')?.classList.remove('hidden');
    }

    /**
     * Render order history
     */
    renderOrderHistory() {
        const ordersList = document.getElementById('ordersList');
        if (!ordersList) return;
        
        if (this.orders.length === 0) {
            ordersList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p data-en="No orders found" data-vi="Chưa có đơn hàng">${this.t('noOrders')}</p>
                </div>
            `;
            return;
        }
        
        const statusColors = {
            confirmed: 'bg-blue-100 text-blue-700',
            processing: 'bg-yellow-100 text-yellow-700',
            shipped: 'bg-purple-100 text-purple-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        
        ordersList.innerHTML = this.orders.slice(0, 5).map(order => `
            <div class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition cursor-pointer" data-order-id="${order.id}">
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <h4 class="font-semibold">${this.currentLanguage === 'vi' ? 'Đơn hàng' : 'Order'} #${order.id}</h4>
                        <p class="text-sm text-gray-500">${this.formatDate(order.orderDate)}</p>
                    </div>
                    <span class="px-3 py-1 ${statusColors[order.status]} rounded-full text-sm font-semibold">
                        ${this.t(order.status)}
                    </span>
                </div>
                <div class="flex items-center justify-between">
                    <p class="text-sm text-gray-600">${order.products.length} ${this.t('products')}</p>
                    <p class="font-bold text-primary">${this.formatPrice(order.total)}</p>
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        ordersList.querySelectorAll('[data-order-id]').forEach(card => {
            card.addEventListener('click', () => {
                const orderId = card.dataset.orderId;
                const order = this.orders.find(o => o.id === orderId);
                if (order) this.displayOrderDetails(order);
            });
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
     * Format date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    /**
     * Format date and time
     */
    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

export default OrderTrackingManager;
