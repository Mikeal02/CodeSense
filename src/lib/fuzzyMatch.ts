/**
 * Simple fuzzy match scoring function.
 * Returns a score > 0 if the query matches the target, 0 otherwise.
 * Higher scores = better matches.
 */
export function fuzzyMatch(query: string, target: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact substring match gets highest score
  if (t.includes(q)) {
    // Bonus for match at start
    const idx = t.indexOf(q);
    return 100 - idx + (q.length / t.length) * 50;
  }

  // Fuzzy: characters must appear in order
  let qi = 0;
  let score = 0;
  let lastMatchIdx = -1;
  let consecutive = 0;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += 10;
      // Bonus for consecutive matches
      if (lastMatchIdx === ti - 1) {
        consecutive++;
        score += consecutive * 5;
      } else {
        consecutive = 0;
      }
      // Bonus for matching at word boundaries
      if (ti === 0 || t[ti - 1] === "/" || t[ti - 1] === "." || t[ti - 1] === "-" || t[ti - 1] === "_" || t[ti - 1] === " ") {
        score += 15;
      }
      lastMatchIdx = ti;
      qi++;
    }
  }

  // All characters must match
  if (qi < q.length) return 0;

  // Normalize by target length (shorter targets rank higher)
  score += Math.max(0, 20 - t.length);

  return score;
}

export interface FuzzyResult<T> {
  item: T;
  score: number;
}

export function fuzzyFilter<T>(
  items: T[],
  query: string,
  getKey: (item: T) => string,
  limit = 20
): FuzzyResult<T>[] {
  if (!query) return items.slice(0, limit).map(item => ({ item, score: 1 }));

  return items
    .map(item => ({ item, score: fuzzyMatch(query, getKey(item)) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
