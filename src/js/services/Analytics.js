/**
 * Consent-aware analytics loader.
 * Scripts are injected only after the visitor opts in AND real IDs are configured.
 * @module services/Analytics
 */

import { isConfiguredId } from '../utils/security.js';
import logger from '../utils/logger.js';

const CONSENT_KEY = 'cookieConsent';

function readConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function applyConsentDefaults() {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }

  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });
}

function updateConsent(granted) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('consent', 'update', {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied'
  });
}

function loadScript(src, attrs = {}) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  Object.entries(attrs).forEach(([key, value]) => {
    script.setAttribute(key, value);
  });
  document.head.appendChild(script);
}

export function initAnalytics(config = {}) {
  applyConsentDefaults();

  const gaId = config.googleAnalyticsId;
  const gtmId = config.googleTagManagerId;
  const pixelId = config.facebookPixelId;

  const enable = () => {
    updateConsent(true);

    if (isConfiguredId(gaId)) {
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`);
      window.gtag('js', new Date());
      window.gtag('config', gaId, { anonymize_ip: true });
      logger.info('[Analytics]', 'Google Analytics enabled');
    }

    if (isConfiguredId(gtmId)) {
      loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`);
      logger.info('[Analytics]', 'Google Tag Manager enabled');
    }

    if (isConfiguredId(pixelId)) {
      loadScript('https://connect.facebook.net/en_US/fbevents.js');
      window.fbq = window.fbq || function fbq() {
        (window.fbq.q = window.fbq.q || []).push(arguments);
      };
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
      logger.info('[Analytics]', 'Meta Pixel enabled');
    }
  };

  const disable = () => {
    updateConsent(false);
    logger.info('[Analytics]', 'Non-essential tracking disabled');
  };

  const consent = readConsent();
  if (consent === 'all') enable();
  else disable();

  document.addEventListener('cookieConsentUpdated', (event) => {
    if (event.detail?.consent === 'all') enable();
    else disable();
  });
}

export default { initAnalytics };
