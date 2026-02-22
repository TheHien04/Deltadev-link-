/**
 * Error Logging & Monitoring Service
 * Centralized error tracking with analytics integration
 */

export class ErrorLogger {
  constructor() {
    this.errors = [];
    this.maxErrors = 50;
    this.isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    this.init();
  }

  init() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError({
        type: 'JavaScript Error',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        type: 'Unhandled Promise Rejection',
        message: event.reason?.message || event.reason,
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.logError({
          type: 'Resource Loading Error',
          resource: event.target.src || event.target.href,
          tagName: event.target.tagName,
          timestamp: new Date().toISOString()
        });
      }
    }, true);

    // Console error override (optional - for capturing console.error calls)
    this.overrideConsoleError();
  }

  logError(error) {
    // Add to local storage
    this.errors.push(error);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (this.isDevelopment) {
      console.error('🚨 Error Logged:', error);
    }

    // Send to analytics
    this.sendToAnalytics(error);

    // Send to external error tracking service (if configured)
    this.sendToErrorTracker(error);

    // Store in localStorage for debugging
    this.saveToLocalStorage();

    // Show user-friendly notification for critical errors
    if (this.isCriticalError(error)) {
      this.showUserNotification(error);
    }
  }

  sendToAnalytics(error) {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: `${error.type}: ${error.message}`,
        fatal: this.isCriticalError(error)
      });
    }

    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('trackCustom', 'Error', {
        error_type: error.type,
        error_message: error.message,
        page: window.location.pathname
      });
    }
  }

  sendToErrorTracker(error) {
    // Send to external service like Sentry, LogRocket, etc.
    // Example: Sentry.captureException(error);
    
    if (this.isDevelopment) {
      return; // Don't send to external service in development
    }

    // Example API call to custom error tracking endpoint
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...error,
          userAgent: navigator.userAgent,
          url: window.location.href,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          referrer: document.referrer
        })
      }).catch(err => {
        console.error('Failed to send error to tracker:', err);
      });
    } catch (err) {
      // Silently fail - don't create error loops
    }
  }

  isCriticalError(error) {
    const criticalTypes = [
      'JavaScript Error',
      'Unhandled Promise Rejection'
    ];

    const criticalMessages = [
      'network',
      'failed to fetch',
      'cannot read property',
      'undefined is not',
      'null is not'
    ];

    if (criticalTypes.includes(error.type)) {
      return true;
    }

    const message = error.message?.toLowerCase() || '';
    return criticalMessages.some(msg => message.includes(msg));
  }

  showUserNotification(error) {
    if (window.showToast) {
      showToast('error',
        'Something went wrong. Please refresh the page.',
        'Đã xảy ra lỗi. Vui lòng tải lại trang.'
      );
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('error_logs', JSON.stringify(this.errors.slice(-20)));
    } catch (err) {
      // localStorage might be full or unavailable
      console.warn('Failed to save errors to localStorage:', err);
    }
  }

  overrideConsoleError() {
    const originalError = console.error;
    console.error = (...args) => {
      // Call original
      originalError.apply(console, args);

      // Log to our system
      this.logError({
        type: 'Console Error',
        message: args.join(' '),
        timestamp: new Date().toISOString()
      });
    };
  }

  // Public API
  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
    localStorage.removeItem('error_logs');
  }

  downloadErrorReport() {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      errors: this.errors
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Manual error logging
  static log(message, context = {}) {
    if (window.errorLogger) {
      window.errorLogger.logError({
        type: 'Manual Log',
        message,
        context,
        timestamp: new Date().toISOString(),
        stack: new Error().stack
      });
    }
  }

  static info(message, context = {}) {
    console.info(message, context);
    // Optional: log non-errors for debugging
  }

  static warn(message, context = {}) {
    console.warn(message, context);
    if (window.errorLogger) {
      window.errorLogger.logError({
        type: 'Warning',
        message,
        context,
        timestamp: new Date().toISOString()
      });
    }
  }
}

// Initialize error logger immediately
const errorLogger = new ErrorLogger();
window.errorLogger = errorLogger;

export default ErrorLogger;
