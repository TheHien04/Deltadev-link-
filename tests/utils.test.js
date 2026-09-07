import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidVnPhone,
  isValidEmail,
  isValidName,
  isValidAddress,
  normalizePhone,
  validatePassword
} from '../src/js/utils/validation.js';
import { levenshteinDistance, stringSimilarity, foldVietnamese } from '../src/js/utils/string.js';
import { formatVnd } from '../src/js/utils/format.js';
import { escapeHtml, isPlaceholderId, isConfiguredId, sha256Hex, deepFreeze } from '../src/js/utils/security.js';
import { verifyAdminPassword } from '../src/js/utils/admin-auth.js';

test('accepts Vietnamese mobile numbers in local and international form', () => {
  assert.equal(isValidVnPhone('0373948649'), true);
  assert.equal(isValidVnPhone('+84373948649'), true);
  assert.equal(isValidVnPhone('0373 948 649'), true);
  assert.equal(isValidVnPhone('12345'), false);
  assert.equal(isValidVnPhone('0213948649'), false);
});

test('normalizes phone punctuation', () => {
  assert.equal(normalizePhone('0373-948-649'), '0373948649');
});

test('validates email, name, and address', () => {
  assert.equal(isValidEmail('thesundaybite@gmail.com'), true);
  assert.equal(isValidEmail('not-an-email'), false);
  assert.equal(isValidName('Hien'), true);
  assert.equal(isValidName('A'), false);
  assert.equal(isValidAddress('Hamlet 8, Mekong Delta, Vietnam'), true);
  assert.equal(isValidAddress('HCM'), false);
});

test('enforces a basic password policy', () => {
  assert.equal(validatePassword('short1').valid, false);
  assert.equal(validatePassword('lettersOnly').valid, false);
  assert.equal(validatePassword('DeltaDev2026').valid, true);
});

test('Levenshtein distance and similarity', () => {
  assert.equal(levenshteinDistance('kitten', 'sitting'), 3);
  assert.equal(levenshteinDistance('lap xuong', 'lap xuong'), 0);
  assert.ok(stringSimilarity('lap xuong', 'lap xuong') === 1);
  assert.ok(stringSimilarity('lap xuong', 'lap xwong') > 0.7);
});

test('folds Vietnamese diacritics for search', () => {
  assert.equal(foldVietnamese('Lạp xưởng'), 'lap xuong');
});

test('formats VND amounts', () => {
  const formatted = formatVnd(190000).replace(/\s/g, '');
  assert.match(formatted, /190[.٬,]000₫/);
  assert.equal(formatVnd(NaN), '0₫');
});

test('escapes HTML and detects placeholder analytics IDs', () => {
  assert.equal(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.equal(isPlaceholderId('G-XXXXXXXXXX'), true);
  assert.equal(isPlaceholderId('GTM-XXXXXXX'), true);
  assert.equal(isPlaceholderId(''), true);
  assert.equal(isConfiguredId('G-ABCD123456'), true);
});

test('sha256Hex is stable and deepFreeze seals nested objects', async () => {
  const digest = await sha256Hex('delta-dev-link');
  assert.equal(digest, await sha256Hex('delta-dev-link'));
  assert.equal(digest.length, 64);
  const tree = { contact: { email: 'a@b.c' } };
  deepFreeze(tree);
  assert.equal(Object.isFrozen(tree), true);
  assert.equal(Object.isFrozen(tree.contact), true);
  assert.throws(() => {
    tree.contact.email = 'other@example.com';
  }, TypeError);
});

test('admin digest rejects empty and well-known demo strings', async () => {
  assert.equal(await verifyAdminPassword(''), false);
  assert.equal(await verifyAdminPassword('admin123'), false);
});
