/**
 * Environment-aware logger.
 * Debug output is silent in production unless ?debug=1 is present.
 * @module utils/logger
 */

const isBrowser = typeof window !== 'undefined';

function isDebugEnabled() {
  if (!isBrowser) return false;
  try {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');
    const params = new URLSearchParams(window.location.search);
    return isLocal || params.get('debug') === '1' || localStorage.getItem('debug') === '1';
  } catch {
    return false;
  }
}

function formatArgs(prefix, args) {
  return prefix ? [`${prefix}`, ...args] : args;
}

export const logger = {
  get enabled() {
    return isDebugEnabled();
  },

  debug(prefix, ...args) {
    if (isDebugEnabled()) console.debug(...formatArgs(prefix, args));
  },

  info(prefix, ...args) {
    if (isDebugEnabled()) console.info(...formatArgs(prefix, args));
  },

  warn(prefix, ...args) {
    if (isDebugEnabled()) console.warn(...formatArgs(prefix, args));
  },

  error(prefix, ...args) {
    console.error(...formatArgs(prefix, args));
  }
};

export default logger;
