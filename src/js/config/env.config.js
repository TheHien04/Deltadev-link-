/**
 * Environment Configuration
 * Manages different environments (dev, staging, production)
 */

const hostname = window.location.hostname;
const protocol = window.location.protocol;

// Detect environment
const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('192.168.');
const isStaging = hostname.includes('staging') || hostname.includes('vercel.app') || hostname.includes('netlify.app');
const isProduction = !isDevelopment && !isStaging;

export const ENV = {
  // Environment flags
  isDevelopment,
  isStaging,
  isProduction,

  // API Configuration
  apiUrl: isDevelopment 
    ? 'http://localhost:3000/api'
    : isStaging
    ? 'https://staging-api.thesundaybite.com'
    : 'https://api.thesundaybite.com',

  // Analytics IDs
  analytics: {
    googleAnalyticsId: isProduction ? 'G-XXXXXXXXXX' : 'G-TEST',
    facebookPixelId: isProduction ? '1234567890' : 'TEST',
    googleTagManagerId: isProduction ? 'GTM-XXXXXX' : 'GTM-TEST'
  },

  // Feature flags
  features: {
    enableDebugMode: isDevelopment,
    enableErrorReporting: !isDevelopment,
    enableAnalytics: !isDevelopment,
    enableServiceWorker: !isDevelopment,
    enableWebVitalsTracking: !isDevelopment,
    enableABTesting: isProduction,
    enableNewsletterPopup: !isDevelopment,
    enableLiveChat: true,
    enableSocialProofNotifications: !isDevelopment
  },

  // Performance configuration
  performance: {
    imageLazyLoadThreshold: 200, // pixels
    debounceDelay: 300, // ms
    throttleDelay: 100, // ms
    cacheExpiration: isDevelopment ? 60000 : 3600000, // 1min dev, 1hr prod
    maxRetries: 3
  },

  // Shopping cart configuration
  cart: {
    maxQuantityPerItem: 99,
    maxTotalItems: 20,
    sessionTimeout: 3600000, // 1 hour
    persistToLocalStorage: true
  },

  // Social media links
  social: {
    zalo: 'https://zalo.me/0333662202',
    facebook: 'https://facebook.com/thesundaybite',
    instagram: 'https://instagram.com/thesundaybite',
    whatsapp: 'https://wa.me/84333662202',
    email: 'thesundaybite@gmail.com',
    phone: '0333 662 202'
  },

  // CDN URLs
  cdn: {
    images: isDevelopment ? '/src/assets/images' : 'https://cdn.thesundaybite.com/images',
    fonts: isDevelopment ? '/src/assets/fonts' : 'https://cdn.thesundaybite.com/fonts',
    static: isDevelopment ? '/' : 'https://cdn.thesundaybite.com'
  },

  // Error tracking
  errorTracking: {
    enabled: !isDevelopment,
    sentryDSN: isProduction ? 'https://xxx@sentry.io/yyy' : null,
    logRocketId: isProduction ? 'xxx/yyy' : null
  },

  // PWA configuration
  pwa: {
    enableBackgroundSync: !isDevelopment,
    enablePushNotifications: isProduction,
    enablePeriodicSync: isProduction,
    cacheName: `sunday-bite-v${ENV_VERSION}`,
    cacheMaxAge: 86400000 // 24 hours
  },

  // Rate limiting
  rateLimits: {
    api: {
      maxRequests: 100,
      windowMs: 60000 // 1 minute
    },
    forms: {
      maxSubmissions: 5,
      windowMs: 300000 // 5 minutes
    }
  },

  // Security
  security: {
    enableCORS: true,
    allowedOrigins: isDevelopment 
      ? ['http://localhost:*', 'http://127.0.0.1:*']
      : ['https://thesundaybite.com', 'https://www.thesundaybite.com'],
    enableCSP: !isDevelopment,
    enableHttps: !isDevelopment
  },

  // Localization
  locale: {
    default: 'vi',
    available: ['vi', 'en'],
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currency: 'VND'
  }
};

// Version info
export const ENV_VERSION = '3.1.0';
export const BUILD_DATE = new Date().toISOString();

// Utility functions
export const getEnvName = () => {
  if (isDevelopment) return 'development';
  if (isStaging) return 'staging';
  return 'production';
};

export const isFeatureEnabled = (featureName) => {
  return ENV.features[featureName] ?? false;
};

export const getApiUrl = (endpoint) => {
  return `${ENV.apiUrl}${endpoint}`;
};

// Log environment info
if (ENV.isDevelopment) {
  console.log('🌍 Environment Configuration:', {
    environment: getEnvName(),
    version: ENV_VERSION,
    features: ENV.features,
    apiUrl: ENV.apiUrl
  });
}

// Freeze config to prevent modifications
Object.freeze(ENV);
Object.freeze(ENV.analytics);
Object.freeze(ENV.features);
Object.freeze(ENV.performance);
Object.freeze(ENV.cart);
Object.freeze(ENV.social);
Object.freeze(ENV.cdn);
Object.freeze(ENV.pwa);
Object.freeze(ENV.security);
Object.freeze(ENV.locale);

export default ENV;
