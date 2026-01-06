// Find all maximal common substrings between two strings
export function findMaximalCommonSubstrings(str1: string, str2: string): string[] {
  const substrings: string[] = [];
  const used1 = new Array(str1.length).fill(false);
  const used2 = new Array(str2.length).fill(false);

  // Find all possible matches and their lengths
  const allMatches: Array<{start1: number, start2: number, length: number, substring: string}> = [];

  for (let i = 0; i < str1.length; i++) {
    if (used1[i]) continue;

    for (let j = 0; j < str2.length; j++) {
      if (used2[j]) continue;

      // Find the longest match starting at positions i and j
      let length = 0;
      while (i + length < str1.length &&
             j + length < str2.length &&
             str1[i + length] === str2[j + length] &&
             !used1[i + length] &&
             !used2[j + length]) {
        length++;
      }

      if (length > 0) {
        allMatches.push({
          start1: i,
          start2: j,
          length: length,
          substring: str1.substring(i, i + length)
        });
      }
    }
  }

  // Sort matches by length (descending) to prioritize longer matches
  allMatches.sort((a, b) => b.length - a.length);

  // Greedily select non-overlapping matches, starting with longest
  // Also ensure forward-only ordering constraint
  for (const match of allMatches) {
    // Check if this match overlaps with any already selected positions
    let canUse = true;
    for (let k = 0; k < match.length; k++) {
      if (used1[match.start1 + k] || used2[match.start2 + k]) {
        canUse = false;
        break;
      }
    }

    // Additional constraint: ensure forward-only ordering
    // This match must come after all previously selected matches in both strings
    if (canUse) {
      for (const existingSubstring of substrings) {
        const existingStart1 = str1.indexOf(existingSubstring);
        const existingStart2 = str2.indexOf(existingSubstring);

        // If this match starts before an existing match in str1,
        // it must also start before that match in str2 (and vice versa)
        if ((match.start1 < existingStart1 && match.start2 > existingStart2) ||
            (match.start1 > existingStart1 && match.start2 < existingStart2)) {
          canUse = false;
          break;
        }
      }
    }

    if (canUse) {
      // Mark positions as used
      for (let k = 0; k < match.length; k++) {
        used1[match.start1 + k] = true;
        used2[match.start2 + k] = true;
      }
      substrings.push(match.substring);
    }
  }

  // Sort results by their original order in str1
  const orderedResults: Array<{substring: string, start1: number}> = [];
  for (const substring of substrings) {
    const start1 = str1.indexOf(substring);
    orderedResults.push({substring, start1});
  }
  orderedResults.sort((a, b) => a.start1 - b.start1);

  return orderedResults.map(r => r.substring);
}
