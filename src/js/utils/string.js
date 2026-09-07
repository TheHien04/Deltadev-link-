/**
 * String utilities used by search and comparison.
 * @module utils/string
 */

/**
 * Levenshtein edit distance between two strings.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function levenshteinDistance(a = '', b = '') {
  const str1 = String(a);
  const str2 = String(b);

  if (str1 === str2) return 0;
  if (!str1.length) return str2.length;
  if (!str2.length) return str1.length;

  const prev = new Array(str2.length + 1);
  const curr = new Array(str2.length + 1);

  for (let j = 0; j <= str2.length; j += 1) prev[j] = j;

  for (let i = 1; i <= str1.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= str2.length; j += 1) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= str2.length; j += 1) prev[j] = curr[j];
  }

  return prev[str2.length];
}

/**
 * Similarity ratio in [0, 1] derived from Levenshtein distance.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function stringSimilarity(a = '', b = '') {
  const left = String(a);
  const right = String(b);
  const longer = left.length >= right.length ? left : right;
  const shorter = left.length >= right.length ? right : left;
  if (!longer.length) return 1;
  return (longer.length - levenshteinDistance(longer, shorter)) / longer.length;
}

/**
 * Fold Vietnamese diacritics for more forgiving search.
 * @param {string} value
 * @returns {string}
 */
export function foldVietnamese(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export default { levenshteinDistance, stringSimilarity, foldVietnamese };
