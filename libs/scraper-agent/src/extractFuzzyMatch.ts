
// Modified Levenshtein that doesn't penalize insertions in the middle of the string
export function modifiedLevenshtein(source: string, target: string): number {
  const sourceLen = source.length;
  const targetLen = target.length;

  // Create a matrix of distances
  const matrix: number[][] = Array(sourceLen + 1).fill(null)
    .map(() => Array(targetLen + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= sourceLen; i++) matrix[i][0] = i;
  for (let j = 0; j <= targetLen; j++) matrix[0][j] = j;

  for (let i = 1; i <= sourceLen; i++) {
    for (let j = 1; j <= targetLen; j++) {
      if (source[i - 1] === target[j - 1]) {
        // Characters match
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        // Calculate costs for different operations
        const substitutionCost = matrix[i - 1][j - 1] + 1;
        const deletionCost = matrix[i - 1][j] + 1;
        // Only penalize insertions at the edges
        const insertionCost = matrix[i][j - 1] + (
          j === 1 || j === targetLen ? 1 : 0
        );

        matrix[i][j] = Math.min(
          substitutionCost,
          deletionCost,
          insertionCost
        );
      }
    }
  }

  return matrix[sourceLen][targetLen];
}

export function extractFuzzyMatch(query: string, text: string, windowSize=5) {
  let bestDistance = Infinity;
  let bestMatch = '';

  // Try different window sizes to account for potential extra characters
  const minWindowSize = Math.max(query.length - windowSize, 3);
  const maxWindowSize = Math.min(query.length + windowSize, text.length);
  for (let thisWindowSize = minWindowSize; thisWindowSize <= maxWindowSize; thisWindowSize++) {
      for (let i = 0; i <= text.length - thisWindowSize; i++) {
          const sample = text.substring(i, i + thisWindowSize);
          const dist = modifiedLevenshtein(query, sample);
          // Only update if distance is lower, or equal distance but shorter length
          if (dist < bestDistance || (dist === bestDistance && sample.length < bestMatch.length)) {
              bestDistance = dist;
              bestMatch = sample;
          }
      }
  }
  // Convert distance to a similarity score (0-100)
  const score = Math.max(0, 100 - (bestDistance * 100 / query.length));
  return { score, match: bestMatch };
}
