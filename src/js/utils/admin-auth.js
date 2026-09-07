/**
 * Demo-only admin gate.
 * This is a static-site lock screen, not production authentication.
 * Rotate PASSWORD_HASH before any public deploy.
 * @module utils/admin-auth
 */

import { sha256Hex } from './security.js';

const SESSION_KEY = 'deltadev_admin_session';
const SESSION_TTL_MS = 4 * 60 * 60 * 1000;

/** SHA-256 digest of the operator-held demo passphrase. Do not store the passphrase in source. */
const PASSWORD_HASH =
  'd10a184192c22cab101c7e755c949a99cbbd275f42ee978f6e5f9be0c38c4edb';

export function hasValidAdminSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    if (!session?.ok || !session?.exp) return false;
    if (Date.now() > session.exp) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function verifyAdminPassword(password) {
  const incoming = await sha256Hex(String(password || ''));
  return incoming === PASSWORD_HASH;
}

export function persistAdminSession() {
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ ok: true, exp: Date.now() + SESSION_TTL_MS })
  );
}

export function clearAdminSession() {
  sessionStorage.removeItem(SESSION_KEY);
  try {
    localStorage.removeItem('adminAuthenticated');
  } catch {
    /* ignore quota / private mode */
  }
}

export default {
  hasValidAdminSession,
  verifyAdminPassword,
  persistAdminSession,
  clearAdminSession
};
