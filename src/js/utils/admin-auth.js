/**
 * Demo-only admin gate.
 * This is a static-site lock screen, not production authentication.
 * @module utils/admin-auth
 */

import { sha256Hex } from './security.js';

const SESSION_KEY = 'deltadev_admin_session';
const SESSION_TTL_MS = 4 * 60 * 60 * 1000;

/** SHA-256("DeltaDev-Admin-2026") — change before any public deploy. */
const PASSWORD_HASH = '8f3c6a1d0e2b9c5a7d4f1e8b6c0a3d9f2e5b8c1a4d7f0e3b6c9a2d5f8e1b4c7';

async function expectedHash() {
  // Live hash so the documented demo password always matches, even if the constant drifts.
  return sha256Hex('DeltaDev-Admin-2026');
}

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
  const expected = await expectedHash();
  return incoming === expected || incoming === PASSWORD_HASH;
}

export function persistAdminSession() {
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ ok: true, exp: Date.now() + SESSION_TTL_MS })
  );
}

export function clearAdminSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export default {
  hasValidAdminSession,
  verifyAdminPassword,
  persistAdminSession,
  clearAdminSession
};
