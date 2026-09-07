/**
 * Locale-aware formatters.
 * @module utils/format
 */

/**
 * Format a VND amount with thousand separators.
 * @param {number} amount
 * @returns {string}
 */
export function formatVnd(amount) {
  const value = Number.isFinite(amount) ? amount : 0;
  return `${value.toLocaleString('vi-VN')}₫`;
}

/**
 * Format a display phone number for Vietnam.
 * @param {string} phone
 * @returns {string}
 */
export function formatPhoneDisplay(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('84')) {
    return `+84 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return String(phone || '');
}

export default { formatVnd, formatPhoneDisplay };
