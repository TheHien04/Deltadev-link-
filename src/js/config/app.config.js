/**
 * Application Configuration
 * Central configuration file for the entire application
 * @module config/app.config
 */

export const APP_CONFIG = {
    // Application Info
    app: {
        name: 'DeltaDev Link',
        version: '3.0.0',
        description: 'Premium Vietnamese Lap Xuong',
        author: 'DeltaDev Link Team',
        buildDate: '2025-02-16'
    },

    // Contact Information
    contact: {
        businessName: 'DeltaDev Link - The Western IT Guy\'s Sausage',
        registrationCode: 'HCB-006-CBDV',
        phone: '+84373948649',
        phoneDisplay: '0373 948 649',
        email: 'thesundaybite@gmail.com',
        address: 'Số 364, tổ 8, ấp Hậu Quới, xã Hậu Mỹ Bắc B, huyện Cái Bè, tỉnh Tiền Giang',
        addressShort: 'Hậu Mỹ Bắc B, Cái Bè, Tiền Giang',
        zaloNumber: '84373948649', // Without + for Zalo deep link
        businessHours: {
            weekday: '8AM - 5PM',
            weekend: '8AM - 5PM'
        }
    },

    // Language Configuration
    language: {
        default: 'en',
        supported: ['en', 'vi'],
        fallback: 'en'
    },

    // Animation Configuration
    animation: {
        aos: {
            duration: 800,
            offset: 100,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        },
        gsap: {
            duration: 1,
            ease: 'power2.out'
        }
    },

    // Products Configuration
    products: {
        classic: {
            id: 'classic',
            price: 190000,
            currency: '₫',
            unit: 'kg'
        },
        gift: {
            id: 'gift',
            price: 205000,
            currency: '₫',
            unit: 'box'
        },
        lean: {
            id: 'lean',
            price: 220000,
            currency: '₫',
            unit: 'kg'
        }
    },

    // Form Configuration
    form: {
        validation: {
            phone: {
                pattern: /^[0-9]{10}$/,
                message: 'Please enter a valid 10-digit phone number'
            },
            name: {
                minLength: 2,
                message: 'Name must be at least 2 characters'
            }
        }
    },

    // Performance Monitoring
    performance: {
        enabled: true,
        reportInterval: 30000, // 30 seconds
        thresholds: {
            lcp: 2500, // Largest Contentful Paint
            fid: 100,  // First Input Delay
            cls: 0.1   // Cumulative Layout Shift
        }
    },

    // API Endpoints (if needed in future)
    api: {
        baseUrl: '',
        endpoints: {
            order: '/api/orders',
            contact: '/api/contact'
        }
    },

    // Feature Flags
    features: {
        enableServiceWorker: true,
        enableAnalytics: true,
        enableChatWidget: true,
        enableNewsletter: true,
        enableShoppingCart: true,
        enableVoucher: true
    },

    // Shopping Cart Configuration
    cart: {
        currency: 'VNĐ',
        taxRate: 0, // No tax for now
        shippingFee: 0, // Free shipping by default
        minOrderAmount: 100000, // Minimum order 100k VND
        maxQuantityPerItem: 20
    },

    // Voucher Configuration
    vouchers: [
        {
            code: 'SUNDAY10',
            discount: 10, // 10% off
            type: 'percentage',
            minOrder: 200000,
            description: {
                en: '10% off for orders over 200k',
                vi: 'Giảm 10% cho đơn từ 200k'
            },
            active: true
        },
        {
            code: 'FIRST50',
            discount: 50000, // 50k off
            type: 'fixed',
            minOrder: 300000,
            description: {
                en: '50k off for first-time customers (order over 300k)',
                vi: 'Giảm 50k cho khách mới (đơn từ 300k)'
            },
            active: true
        },
        {
            code: 'MEMBER20',
            discount: 20, // 20% off
            type: 'percentage',
            minOrder: 500000,
            description: {
                en: '20% off for orders over 500k',
                vi: 'Giảm 20% cho đơn từ 500k'
            },
            active: true
        }
    ],

    // Live Chat Configuration
    liveChat: {
        zalo: {
            enabled: true,
            oaId: '4008770505164886792', // Replace with your Zalo OA ID
            phoneNumber: '0373948649'
        },
        facebook: {
            enabled: true,
            pageId: 'nthehien04',
            pageUrl: 'https://www.facebook.com/nthehien04',
            appId: ''
        },
        whatsapp: {
            enabled: true,
            phoneNumber: '84373948649' // International format without +
        }
    },

    // SEO Configuration
    seo: {
        siteName: 'DeltaDev Link',
        siteUrl: 'https://deltadevlink.com',
        twitterHandle: '@thesundaybite',
        ogImage: '/src/assets/images/Product2.jpg'
    }
};

// Freeze config to prevent modifications
Object.freeze(APP_CONFIG);

export default APP_CONFIG;
