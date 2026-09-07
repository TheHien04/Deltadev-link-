/**
 * Environment Configuration
 * Detects runtime environment and exposes safe, freeze-dried settings.
 * @module config/env.config
 */

import { deepFreeze } from '../utils/security.js';

export const ENV_VERSION = '3.2.1';
export const BUILD_DATE = '2026-09-07';

function detectEnvironment() {
  if (typeof window === 'undefined') {
    return { isDevelopment: true, isStaging: false, isProduction: false };
  }

  const hostname = window.location.hostname;
  const isDevelopment =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.endsWith('.local');
  const isStaging =
    hostname.includes('staging') ||
    hostname.includes('vercel.app') ||
    hostname.includes('netlify.app') ||
    hostname.includes('github.io');

  return {
    isDevelopment,
    isStaging,
    isProduction: !isDevelopment && !isStaging
  };
}

const { isDevelopment, isStaging, isProduction } = detectEnvironment();

export const ENV = {
  isDevelopment,
  isStaging,
  isProduction,

  analytics: {
    googleAnalyticsId: '',
    facebookPixelId: '',
    googleTagManagerId: ''
  },

  features: {
    enableDebugMode: isDevelopment,
    enableErrorReporting: isProduction,
    enableAnalytics: isProduction,
    enableServiceWorker: !isDevelopment,
    enableWebVitalsTracking: isProduction,
    enableLiveChat: true
  },

  performance: {
    imageLazyLoadThreshold: 200,
    debounceDelay: 300,
    throttleDelay: 100,
    cacheExpiration: isDevelopment ? 60_000 : 3_600_000,
    maxRetries: 3
  },

  cart: {
    maxQuantityPerItem: 20,
    maxTotalItems: 20,
    sessionTimeout: 3_600_000,
    persistToLocalStorage: true
  },

  social: {
    zalo: 'https://zalo.me/0373948649',
    facebook: 'https://www.facebook.com/nthehien04',
    whatsapp: 'https://wa.me/84373948649',
    email: 'thesundaybite@gmail.com',
    phone: '0373948649'
  },

  cdn: {
    images: '/src/assets/images',
    fonts: '/src/assets/fonts',
    static: '/'
  },

  pwa: {
    enableBackgroundSync: isProduction,
    enablePushNotifications: false,
    cacheName: `deltadev-link-v${ENV_VERSION}`,
    cacheMaxAge: 86_400_000
  },

  security: {
    allowedOrigins: isDevelopment
      ? ['http://localhost:*', 'http://127.0.0.1:*']
      : ['https://deltadevlink.com', 'https://www.deltadevlink.com'],
    enableHttps: !isDevelopment
  },

  locale: {
    default: 'en',
    available: ['en', 'vi'],
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    currency: 'VND'
  }
};

export const getEnvName = () => {
  if (isDevelopment) return 'development';
  if (isStaging) return 'staging';
  return 'production';
};

export const isFeatureEnabled = (featureName) => ENV.features[featureName] ?? false;

deepFreeze(ENV);

export default ENV;
