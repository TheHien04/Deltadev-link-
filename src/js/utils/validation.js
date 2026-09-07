/**
 * Shared input validation for Vietnam-first checkout.
 * @module utils/validation
 */

/** Vietnamese mobile numbers: 0xxxxxxxxx or +84xxxxxxxxx */
export const VN_PHONE_PATTERN = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalize a phone number by stripping spaces, dots, and dashes.
 * @param {string} phone
 * @returns {string}
 */
export function normalizePhone(phone) {
  return String(phone || '').replace(/[\s.\-()]/g, '');
}

/**
 * Validate a Vietnamese mobile number.
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidVnPhone(phone) {
  return VN_PHONE_PATTERN.test(normalizePhone(phone));
}

/**
 * Validate an email address.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const value = String(email || '').trim();
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}

/**
 * Validate a person's name.
 * @param {string} name
 * @param {number} [minLength=2]
 * @returns {boolean}
 */
export function isValidName(name, minLength = 2) {
  const value = String(name || '').trim();
  return value.length >= minLength && value.length <= 80;
}

/**
 * Validate a delivery address.
 * @param {string} address
 * @param {number} [minLength=8]
 * @returns {boolean}
 */
export function isValidAddress(address, minLength = 8) {
  const value = String(address || '').trim();
  return value.length >= minLength && value.length <= 240;
}

/**
 * Validate password strength for the demo account system.
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePassword(password) {
  const value = String(password || '');
  if (value.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return { valid: false, message: 'Password must include letters and numbers' };
  }
  return { valid: true, message: '' };
}

export default {
  VN_PHONE_PATTERN,
  EMAIL_PATTERN,
  normalizePhone,
  isValidVnPhone,
  isValidEmail,
  isValidName,
  isValidAddress,
  validatePassword
};
