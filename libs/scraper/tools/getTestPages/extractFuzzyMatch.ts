import { distance } from 'fastest-levenshtein';

export function extractFuzzyMatch(query: string, text: string) {
  let bestDistance = Infinity;
  let bestMatch = '';

  // Try windows from query length up to query length + some padding
  for (let windowSize = query.length; windowSize <= query.length + 4; windowSize++) {
      for (let i = 0; i <= text.length - windowSize; i++) {
          const window = text.substring(i, i + windowSize);
          const dist = distance(query, window);
          // Only update if distance is lower, or equal distance but shorter length
          if (dist < bestDistance || (dist === bestDistance && window.length < bestMatch.length)) {
              bestDistance = dist;
              bestMatch = window;
          }
      }
      // If we've found a perfect match, no need to try larger windows
      if (bestDistance === 0) break;
  }
  // Convert distance to a similarity score (0-100)
  const score = Math.max(0, 100 - (bestDistance * 100 / query.length));
  return { score, match: bestMatch };
}
