import { findMaximalCommonSubstrings } from "@thecointech/scraper/findSubstrings";

//
// Search text string for query, extracting the most likely
// account number matching query.  This splits into word tokens,
// fuzzy-matches the token group vs query, and will then
// penalize non-numbers remaining in the token group.
export function extractFuzzyMatch(query: string, text: string) {
  // Split text into tokens while preserving delimiters
  const tokens = text.split(/(\s+)/).filter(token => token.length > 0);

  let bestScore = 0;
  let bestMatch = '';

  // Try all possible token groupings starting from each position
  for (let startIdx = 0; startIdx < tokens.length; startIdx++) {
    let currentGroup = '';

    // Build progressively longer token groups
    for (let endIdx = startIdx; endIdx < tokens.length; endIdx++) {
      currentGroup += tokens[endIdx];

      // Stop if group becomes much longer than query (with some buffer)
      const maxLength = Math.max(query.length * 1.5, query.length + 10);
      if (currentGroup.length > maxLength) {
        break;
      }

      // Skip very short groups unless they're close to query length
      if (currentGroup.length < Math.max(3, query.length * 0.5)) {
        continue;
      }

      // const distance = levenshtein(query, currentGroup);

      // Calculate account number "likeness" score
      const accountLikeness = calculateAccountLikeness(query, currentGroup);

      if (accountLikeness > bestScore) {
        bestScore = accountLikeness;
        // bestDistance = distance;
        bestMatch = currentGroup;
      }
    }
  }

  // Convert distance to a similarity score (0-100)
  const maxScore = 10 + query.length * 3;
  const score = Math.max(0, 100 - (bestScore * 100 / maxScore));
  return { score, match: bestMatch.trim() };
}

// Calculate how "account number-like" a string is
function calculateAccountLikeness(query: string, str: string): number {
  let score = 0;

  // Find all maximal common substrings between query and str
  const commonSubstrings = findMaximalCommonSubstrings(query, str);
  const totalCommonLength = commonSubstrings.reduce((sum, substr) => sum + substr.length, 0);

  // Award points for common substring length
  score += totalCommonLength * 3;

  // Remove matched substrings from str
  let remainingStr = str;
  for (const substr of commonSubstrings) {
    remainingStr = remainingStr.replace(substr, '');
  }

  // Penalize letters (except common masking like X)
  const badChars = remainingStr.split('').filter(c => /[a-zA-Z]/.test(c) && c !== 'X').length;
  score -= badChars * 3;

  // Bonus for starting with digits or asterisks
  if (/^[0-9*]/.test(str)) score += 5;

  // Bonus for ending with digits
  if (/[0-9]$/.test(str)) score += 5;

  return score;
}
