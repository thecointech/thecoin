import { extractFuzzyMatch, modifiedLevenshtein } from "./extractFuzzyMatch";

describe('extractFuzzyMatch', () => {
  it('correctly finds a match with masked credit card number', () => {
    const realNumber = "1234 12** **** 1234";
    const goodstring = `Account Number: ${realNumber} - Chequing: $12345.67`
    const inferredNumber = "1234 **** 1234" // Off by a few digits

    const match = extractFuzzyMatch(inferredNumber, goodstring);
    expect(match.match).toBe('1234 12** **** 1234');
  });

  it('handles basic string modifications', () => {
    // Middle insertions should have no cost
    expect(modifiedLevenshtein("1234", "12**34")).toBe(0);
    // Edge insertions should cost 1
    expect(modifiedLevenshtein("1234", "*1234")).toBe(1);
    // Substitutions should cost 1
    expect(modifiedLevenshtein("1234", "1235")).toBe(1);
    // Deletions should cost 1
    expect(modifiedLevenshtein("1234", "123")).toBe(1);
  });
});
