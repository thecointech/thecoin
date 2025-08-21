import { findMaximalCommonSubstrings } from "./findSubstrings";

describe("findMaximalCommonSubstrings", () => {
  it('finds exact match', () => {
    const result = findMaximalCommonSubstrings("1234", "1234");
    expect(result).toEqual(["1234"]);
  });

  it('finds partial match at start', () => {
    const result = findMaximalCommonSubstrings("1234", "123abc");
    expect(result).toEqual(["123"]);
  });

  it('finds partial match at end', () => {
    const result = findMaximalCommonSubstrings("1234", "abc234");
    expect(result).toEqual(["234"]);
  });

  it('finds multiple separate matches', () => {
    const result = findMaximalCommonSubstrings("1234 7890", "1234 abc 7890");
    expect(result).toEqual(["1234 ", "7890"]);
  });

  it('respects forward-only matching (no reverse matches)', () => {
    const result = findMaximalCommonSubstrings("1234", "4321");
    expect(result).toEqual(["1"]); // Should not match reversed digits
  });

  it('finds single character matches', () => {
    const result = findMaximalCommonSubstrings("1a2b", "1x2y");
    expect(result).toEqual(["1", "2"]);
  });

  it('handles account number example from user', () => {
    const result = findMaximalCommonSubstrings("1234 7891", "1234 8 7890");
    expect(result).toEqual(["1234 ", "789"]);
    const totalLength = result.reduce((sum, s) => sum + s.length, 0);
    expect(totalLength).toBe(8); // This includes the space, which I guess is good?
  });

  it('handles masked account numbers', () => {
    const result = findMaximalCommonSubstrings("****1234", "***1234");
    expect(result).toEqual(["***1234"]);
  });

  it('handles spaces and special characters', () => {
    const result = findMaximalCommonSubstrings("12-34 56", "12-34-56");
    expect(result).toEqual(["12-34", "56"]);
  });

  it('handles empty strings', () => {
    expect(findMaximalCommonSubstrings("", "")).toEqual([]);
    expect(findMaximalCommonSubstrings("123", "")).toEqual([]);
    expect(findMaximalCommonSubstrings("", "123")).toEqual([]);
  });

  it('handles no matches', () => {
    const result = findMaximalCommonSubstrings("abc", "xyz");
    expect(result).toEqual([]);
  });

  it('handles overlapping patterns correctly', () => {
    const result = findMaximalCommonSubstrings("abab", "abcab");
    expect(result).toEqual(["ab", "ab"]);
  });

  it('prioritizes longer matches over shorter ones', () => {
    const result = findMaximalCommonSubstrings("123456", "12abc3456");
    expect(result).toEqual(["12", "3456"]); // Should find "12" then "3456", not individual digits
  });

  it('finds the longest substring when the first match is out-of-order', () => {
    const result = findMaximalCommonSubstrings("123456", "234561");
    expect(result).toEqual(["23456"]); // Should not
  });

  it('finds the longest substrings when there are multiple OOO matches', () => {
    const result = findMaximalCommonSubstrings("123 1234589", "123 2234588")
    expect(result).toEqual(["123 ", "23458"]);
  })

  it('does great', () => {
    const result = findMaximalCommonSubstrings("12345 12345", "22345 12345")
    expect(result).toEqual(["2345 ", "12345"]);
  })
});
