export interface DiceMatch {
  item: string;
  score: number;
}

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

  const hash = (s: string): number => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return h;
  };

  const counts = new Map<number, number>();
  for (let i = 0; i < len1; i++) {
    const h = hash(str1.slice(i, i + n));
    counts.set(h, (counts.get(h) || 0) + 1);
  }

  let intersection = 0;
  for (let i = 0; i < len2; i++) {
    const h = hash(str2.slice(i, i + n));
    const c = counts.get(h);
    if (c) {
      counts.set(h, c - 1);
      intersection++;
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
  const avgLen = str.length;
  const n = avgLen <= 15 ? 2 : avgLen <= 30 ? 3 : 4;
  const lenStr = str.length - n + 1;
  if (lenStr <= 0) return arr.map(item => ({ item, score: 0 }));

  const hash = (s: string): number => {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return h;
  };

  const countsStr = new Map<number, number>();
  for (let i = 0; i < lenStr; i++) {
    const h = hash(str.slice(i, i + n));
    countsStr.set(h, (countsStr.get(h) || 0) + 1);
  }

  return arr.map(item => {
    const s = item.toLowerCase().trim();
    const lenItem = s.length - n + 1;
    if (lenItem <= 0) return { item, score: 0 };

    const counts = new Map(countsStr);
    let intersection = 0;

    for (let i = 0; i < lenItem; i++) {
      const h = hash(s.slice(i, i + n));
      const c = counts.get(h);
      if (c) {
        counts.set(h, c - 1);
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
    .filter(r => r.score >= cutoff)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
