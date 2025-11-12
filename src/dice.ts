export interface DiceMatch {
  item: string;
  score: number;
}

const BASE = 131 >>> 0;

const getNGramCounts = (s: string, nGram: number): Map<number, number> => {
  const m = new Map<number, number>();
  if (nGram <= 0 || s.length < nGram) return m;

  // compute base^(n-1)
  let pow = 1 >>> 0;
  for (let i = 0; i < nGram - 1; i++) pow = (pow * BASE) >>> 0;

  // initial hash: weighted by BASE^(n-1-i)
  let h = 0 >>> 0;
  for (let i = 0; i < nGram; i++) {
    h = (h * BASE + s.charCodeAt(i)) >>> 0;
  }
  m.set(h, (m.get(h) || 0) + 1);

  for (let i = nGram; i < s.length; i++) {
    const out = s.charCodeAt(i - nGram);
    const ino = s.charCodeAt(i);
    // remove outgoing, multiply, add incoming
    h =
      (((h + 0x100000000 - ((out * pow) % 0x100000000)) >>> 0) * BASE + ino) >>>
      0;
    m.set(h, (m.get(h) || 0) + 1);
  }
  return m;
};

/**
 * Dice Coefficient between two strings.
 * Uses adaptive n-gram size based on string length.
 */
export function diceCoefficient(str1: string, str2: string): number {
  str1 = str1.toLowerCase().trim();
  str2 = str2.toLowerCase().trim();
  if (str1 === str2) return 1;
  if (!str1.length || !str2.length) return 0;

  const avgLen = (str1.length + str2.length) / 2;
  const n = avgLen <= 15 ? 2 : avgLen <= 30 ? 3 : 4;

  const len1 = str1.length - n + 1;
  const len2 = str2.length - n + 1;
  if (len1 <= 0 || len2 <= 0) return 0;

  const counts1 = getNGramCounts(str1, n);

  // Instead of cloning counts1, track per-hash matches for str2 to avoid overcounting.
  let intersection = 0;
  if (len2 > 0) {
    // rolling hash over str2
    let pow = 1 >>> 0;
    for (let i = 0; i < n - 1; i++) pow = (pow * BASE) >>> 0;

    let h = 0 >>> 0;
    for (let i = 0; i < n; i++) h = (h * BASE + str2.charCodeAt(i)) >>> 0;

    const matched = new Map<number, number>();
    const avail = counts1.get(h) || 0;
    if (matched.get(h) || 0 < avail) {
      const prev = matched.get(h) || 0;
      if (prev < avail) {
        matched.set(h, prev + 1);
        intersection++;
      }
    }

    for (let i = n; i < str2.length; i++) {
      const out = str2.charCodeAt(i - n);
      const ino = str2.charCodeAt(i);
      h =
        (((h + 0x100000000 - ((out * pow) % 0x100000000)) >>> 0) * BASE +
          ino) >>>
        0;
      const available = counts1.get(h) || 0;
      const prevMatched = matched.get(h) || 0;
      if (prevMatched < available) {
        matched.set(h, prevMatched + 1);
        intersection++;
      }
    }
  }

  return (2 * intersection) / (len1 + len2);
}

/**
 * Compute Dice Coefficient of one string vs an array efficiently.
 * Precomputes n-grams of target string once.
 */
export function diceCoefficientArray(str: string, arr: string[]): DiceMatch[] {
  str = str.toLowerCase().trim();
  const n = str.length <= 15 ? 2 : str.length <= 30 ? 3 : 4;
  const lenStr = str.length - n + 1;
  if (lenStr <= 0) return arr.map((item) => ({ item, score: 0 }));

  const countsStr = getNGramCounts(str, n);

  return arr.map((item) => {
    const s = item.toLowerCase().trim();
    const lenItem = s.length - n + 1;
    if (lenItem <= 0) return { item, score: 0 };

    // walk item n-grams with rolling hash and track matched counts to avoid copying countsStr
    let intersection = 0;
    let pow = 1 >>> 0;
    for (let i = 0; i < n - 1; i++) pow = (pow * BASE) >>> 0;

    let h = 0 >>> 0;
    for (let i = 0; i < n; i++) h = (h * BASE + s.charCodeAt(i)) >>> 0;

    const matched = new Map<number, number>();
    const avail0 = countsStr.get(h) || 0;
    if ((matched.get(h) || 0) < avail0) {
      matched.set(h, (matched.get(h) || 0) + 1);
      intersection++;
    }

    for (let i = n; i < s.length; i++) {
      const out = s.charCodeAt(i - n);
      const ino = s.charCodeAt(i);
      h =
        (((h + 0x100000000 - ((out * pow) % 0x100000000)) >>> 0) * BASE +
          ino) >>>
        0;
      const avail = countsStr.get(h) || 0;
      const prev = matched.get(h) || 0;
      if (prev < avail) {
        matched.set(h, prev + 1);
        intersection++;
      }
    }

    return { item, score: (2 * intersection) / (lenStr + lenItem) };
  });
}

/**
 * Returns the top N matches above a given cutoff score.
 */
export function diceCoefficientTopMatches(
  str: string,
  arr: string[],
  topN: number = 0,
  cutoff: number = 0
): DiceMatch[] {
  const results = diceCoefficientArray(str, arr);
  if (!topN) topN = results.length;
  return results
    .filter((r) => r.score >= cutoff)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
