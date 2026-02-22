/**
 * Live Chat Widget Manager
 * Handles live chat functionality (Zalo, Facebook Messenger)
 * @module managers/LiveChatWidget
 */

export class LiveChatWidget {
    constructor(appState, config) {
        this.appState = appState;
        this.config = config;
        this.isOpen = false;
    }

    /**
     * Initialize live chat widget
     */
    init() {
        console.log('[LiveChatWidget] Initializing...');
        
        if (!this.config.features.enableChatWidget) {
            console.log('[LiveChatWidget] Chat widget disabled in config');
            return;
        }
        
        this.createChatWidget();
        this.attachEventListeners();
        
        console.log('[LiveChatWidget] Initialized successfully');
    }

    /**
     * Create chat widget UI
     */
    createChatWidget() {
        // Create chat button
        const chatButton = document.createElement('button');
        chatButton.id = 'chatButton';
        chatButton.className = 'fixed bottom-48 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all transform hover:scale-110 z-50 flex items-center justify-center';
        chatButton.setAttribute('aria-label', 'Live Chat');
        chatButton.innerHTML = `
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        `;
        document.body.appendChild(chatButton);

        // Create chat panel
        const chatPanel = document.createElement('div');
        chatPanel.id = 'chatPanel';
        chatPanel.className = 'fixed bottom-64 right-6 w-80 bg-white rounded-lg shadow-2xl transform scale-0 origin-bottom-right transition-all duration-300 z-50 overflow-hidden';
        chatPanel.innerHTML = `
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <span class="text-2xl">💬</span>
                    </div>
                    <div>
                        <h4 class="font-bold text-sm">DeltaDev Link</h4>
                        <p class="text-xs opacity-90" data-en="Online now" data-vi="Đang online">Online now</p>
                    </div>
                </div>
                <button id="closeChatPanel" class="text-white hover:text-gray-200 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            
            <div class="p-4 bg-gray-50 max-h-80 overflow-y-auto">
                <div class="bg-white rounded-lg p-4 mb-3 shadow-sm">
                    <p class="text-sm text-gray-700">
                        <span data-en="Hello! 👋 How can we help you today?" 
                              data-vi="Xin chào! 👋 Chúng tôi có thể giúp gì cho bạn?">
                            Hello! 👋 How can we help you today?
                        </span>
                    </p>
                    <p class="text-xs text-gray-500 mt-2" data-en="Choose a channel to chat:" data-vi="Chọn kênh để chat:">
                        Choose a channel to chat:
                    </p>
                </div>
            </div>
            
            <div class="p-4 space-y-3 border-t">
                ${this.config.liveChat.zalo.enabled ? `
                <button class="chat-option w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition border border-gray-200" data-channel="zalo">
                    <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                        </svg>
                    </div>
                    <div class="text-left flex-1">
                        <p class="font-semibold text-gray-800">Chat qua Zalo</p>
                        <p class="text-xs text-gray-500">Phản hồi nhanh nhất</p>
                    </div>
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </button>
                ` : ''}
                
                ${this.config.liveChat.facebook.enabled ? `
                <button class="chat-option w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition border border-gray-200" data-channel="facebook">
                    <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                    </div>
                    <div class="text-left flex-1">
                        <p class="font-semibold text-gray-800">Facebook Messenger</p>
                        <p class="text-xs text-gray-500">Chat trên Facebook</p>
                    </div>
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </button>
                ` : ''}
                
                ${this.config.liveChat.whatsapp && this.config.liveChat.whatsapp.enabled ? `
                <button class="chat-option w-full flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition border border-gray-200" data-channel="whatsapp">
                    <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                    </div>
                    <div class="text-left flex-1">
                        <p class="font-semibold text-gray-800">WhatsApp</p>
                        <p class="text-xs text-gray-500">Chat qua WhatsApp</p>
                    </div>
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </button>
                ` : ''}
                
                <button class="chat-option w-full flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition border border-gray-200" data-channel="phone">
                    <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                    </div>
                    <div class="text-left flex-1">
                        <p class="font-semibold text-gray-800" data-en="Call Us" data-vi="Gọi Điện">Call Us</p>
                        <p class="text-xs text-primary font-semibold">${this.config.contact.phoneDisplay}</p>
                    </div>
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </button>
            </div>
        `;
        document.body.appendChild(chatPanel);

        this.chatButton = chatButton;
        this.chatPanel = chatPanel;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Toggle chat panel
        this.chatButton.addEventListener('click', () => this.toggleChat());
        
        // Close chat panel
        document.getElementById('closeChatPanel').addEventListener('click', () => this.closeChat());

        // Chat options
        document.querySelectorAll('.chat-option').forEach(option => {
            option.addEventListener('click', () => {
                const channel = option.dataset.channel;
                this.openChannel(channel);
            });
        });
    }

    /**
     * Toggle chat panel
     */
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    /**
     * Open chat panel
     */
    openChat() {
        this.chatPanel.classList.remove('scale-0');
        this.chatPanel.classList.add('scale-100');
        this.isOpen = true;
    }

    /**
     * Close chat panel
     */
    closeChat() {
        this.chatPanel.classList.remove('scale-100');
        this.chatPanel.classList.add('scale-0');
        this.isOpen = false;
    }

    /**
     * Open specific chat channel
     */
    openChannel(channel) {
        let url = '';
        
        switch (channel) {
            case 'zalo':
                url = `https://zalo.me/${this.config.contact.zaloNumber}`;
                break;
            case 'facebook':
                url = `https://m.me/${this.config.liveChat.facebook.pageId}`;
                break;
            case 'whatsapp':
                url = `https://wa.me/${this.config.liveChat.whatsapp.phoneNumber}?text=Hello%20The%20Sunday%20Bite!%20T%C3%B4i%20mu%E1%BB%91n%20%C4%91%E1%BA%B7t%20h%C3%A0ng%20l%E1%BA%A1p%20x%C6%B0%E1%BB%9Fng`;
                break;
            case 'phone':
                url = `tel:${this.config.contact.phone}`;
                break;
        }
        
        if (url) {
            window.open(url, '_blank');
            this.closeChat();
        }
    }
}

export default LiveChatWidget;
