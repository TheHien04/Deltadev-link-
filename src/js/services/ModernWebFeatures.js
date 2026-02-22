/**
 * Modern Web Features Service
 * Implements cutting-edge 2026 web technologies
 */

export class ModernWebFeatures {
  constructor() {
    this.init();
  }

  init() {
    this.setupWebShare();
    this.setupViewTransitions();
    this.setupWebVitals();
    this.setupBadgeAPI();
    this.setupFileSystemAccess();
  }

  // ============================================================
  // 1. WEB SHARE API (Level 2) - Share products natively
  // ============================================================
  async shareProduct(product) {
    if (!navigator.share) {
      console.log('Web Share API not supported');
      this.fallbackShare(product);
      return;
    }

    try {
      // Create share data with files (Web Share API Level 2)
      const shareData = {
        title: `${product.name} - DeltaDev Link`,
        text: `Check out this premium lap xuong: ${product.name} - Only ${this.formatPrice(product.price)}!`,
        url: `${window.location.origin}?product=${product.id}`,
      };

      // If product has image, share it too (Level 2 feature)
      if (product.image) {
        const blob = await this.fetchImageAsBlob(product.image);
        const file = new File([blob], 'product.jpg', { type: 'image/jpeg' });
        shareData.files = [file];
      }

      await navigator.share(shareData);
      
      // Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
          method: 'Web Share API',
          content_type: 'product',
          item_id: product.id
        });
      }

      return { success: true };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
      return { success: false, error };
    }
  }

  fallbackShare(product) {
    const url = `${window.location.origin}?product=${product.id}`;
    navigator.clipboard.writeText(url);
    
    if (window.showToast) {
      showToast('success', 
        'Product link copied to clipboard!',
        'Đã sao chép liên kết sản phẩm!'
      );
    }
  }

  async fetchImageAsBlob(imageUrl) {
    const response = await fetch(imageUrl);
    return await response.blob();
  }

  // ============================================================
  // 2. VIEW TRANSITIONS API - Smooth page transitions
  // ============================================================
  setupViewTransitions() {
    if (!document.startViewTransition) {
      console.log('View Transitions API not supported');
      return;
    }

    // Intercept navigation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      this.transitionToSection(targetId);
    });
  }

  transitionToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target) return;

    if (!document.startViewTransition) {
      target.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Use View Transitions API for smooth morphing
    document.startViewTransition(() => {
      target.scrollIntoView({ behavior: 'instant' });
    });

    // Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_location: `#${sectionId}`,
        page_title: sectionId
      });
    }
  }

  // ============================================================
  // 3. WEB VITALS - Core Web Vitals tracking
  // ============================================================
  setupWebVitals() {
    // Largest Contentful Paint (LCP)
    this.observeLCP();
    
    // First Input Delay (FID) / Interaction to Next Paint (INP)
    this.observeINP();
    
    // Cumulative Layout Shift (CLS)
    this.observeCLS();
    
    // Time to First Byte (TTFB)
    this.observeTTFB();
  }

  observeLCP() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        const lcp = lastEntry.renderTime || lastEntry.loadTime;
        console.log('LCP:', lcp.toFixed(2), 'ms');
        
        // Send to analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'LCP',
            value: Math.round(lcp),
            metric_rating: lcp < 2500 ? 'good' : lcp < 4000 ? 'needs-improvement' : 'poor'
          });
        }
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (error) {
      console.error('LCP observation failed:', error);
    }
  }

  observeINP() {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        let maxDuration = 0;
        
        for (const entry of list.getEntries()) {
          if (entry.duration > maxDuration) {
            maxDuration = entry.duration;
          }
        }

        if (maxDuration > 0) {
          console.log('INP:', maxDuration.toFixed(2), 'ms');
          
          if (typeof gtag !== 'undefined') {
            gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'INP',
              value: Math.round(maxDuration),
              metric_rating: maxDuration < 200 ? 'good' : maxDuration < 500 ? 'needs-improvement' : 'poor'
            });
          }
        }
      });

      observer.observe({ type: 'event', durationThreshold: 16, buffered: true });
    } catch (error) {
      console.error('INP observation failed:', error);
    }
  }

  observeCLS() {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }

        console.log('CLS:', clsValue.toFixed(4));
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'CLS',
            value: Math.round(clsValue * 1000),
            metric_rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor'
          });
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (error) {
      console.error('CLS observation failed:', error);
    }
  }

  observeTTFB() {
    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        console.log('TTFB:', ttfb.toFixed(2), 'ms');
        
        if (typeof gtag !== 'undefined') {
          gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'TTFB',
            value: Math.round(ttfb),
            metric_rating: ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs-improvement' : 'poor'
          });
        }
      }
    } catch (error) {
      console.error('TTFB observation failed:', error);
    }
  }

  // ============================================================
  // 4. BADGING API - App icon badge (installed PWA)
  // ============================================================
  setupBadgeAPI() {
    if (!('setAppBadge' in navigator)) {
      console.log('Badging API not supported');
      return;
    }
    
    this.updateCartBadge(0);
  }

  async updateCartBadge(count) {
    if (!('setAppBadge' in navigator)) return;

    try {
      if (count > 0) {
        await navigator.setAppBadge(count);
      } else {
        await navigator.clearAppBadge();
      }
    } catch (error) {
      console.error('Badge update failed:', error);
    }
  }

  // ============================================================
  // 5. FILE SYSTEM ACCESS API - Save orders locally
  // ============================================================
  setupFileSystemAccess() {
    if (!('showSaveFilePicker' in window)) {
      console.log('File System Access API not supported');
      return;
    }
  }

  async saveOrderToFile(orderData) {
    if (!('showSaveFilePicker' in window)) {
      this.fallbackDownload(orderData);
      return;
    }

    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: `order-${Date.now()}.json`,
        types: [{
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] }
        }]
      });

      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(orderData, null, 2));
      await writable.close();

      if (window.showToast) {
        showToast('success', 
          'Order saved successfully!',
          'Đơn hàng đã được lưu thành công!'
        );
      }

      return { success: true };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('File save failed:', error);
      }
      return { success: false, error };
    }
  }

  fallbackDownload(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================
  formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  // Check feature support
  static checkSupport() {
    return {
      webShare: 'share' in navigator,
      webShareFiles: navigator.canShare && navigator.canShare({ files: [] }),
      viewTransitions: 'startViewTransition' in document,
      performanceObserver: 'PerformanceObserver' in window,
      badging: 'setAppBadge' in navigator,
      fileSystemAccess: 'showSaveFilePicker' in window,
      webPush: 'PushManager' in window,
      webAuthn: 'credentials' in navigator,
      paymentRequest: 'PaymentRequest' in window,
      containerQueries: CSS.supports('container-type: inline-size')
    };
  }
}

// Initialize modern features
let modernFeatures;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    modernFeatures = new ModernWebFeatures();
    window.modernFeatures = modernFeatures;
    
    // Log supported features
    console.log('🚀 Modern Web Features Support:', ModernWebFeatures.checkSupport());
  });
} else {
  modernFeatures = new ModernWebFeatures();
  window.modernFeatures = modernFeatures;
}

export default ModernWebFeatures;
