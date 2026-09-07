/**
 * Security helpers for a static storefront.
 * These are defense-in-depth for XSS and demo auth — not a substitute for a backend.
 * @module utils/security
 */

const PLACEHOLDER_ID = /^(G-X+|GTM-X+|YOUR_|TEST$|1234567890$)/i;

/**
 * Escape untrusted text before inserting into HTML.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * SHA-256 hex digest. Used for demo-only credential storage.
 * @param {string} value
 * @returns {Promise<string>}
 */
export async function sha256Hex(value) {
  const encoded = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * True when an analytics / pixel ID is a documented placeholder.
 * @param {unknown} id
 * @returns {boolean}
 */
export function isPlaceholderId(id) {
  if (!id || typeof id !== 'string') return true;
  const trimmed = id.trim();
  if (!trimmed) return true;
  return PLACEHOLDER_ID.test(trimmed);
}

/**
 * True when an ID looks production-ready.
 * @param {unknown} id
 * @returns {boolean}
 */
export function isConfiguredId(id) {
  return !isPlaceholderId(id);
}

export default {
  escapeHtml,
  sha256Hex,
  isPlaceholderId,
  isConfiguredId
};
