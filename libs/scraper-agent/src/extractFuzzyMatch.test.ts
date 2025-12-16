import { extractFuzzyMatch } from "./extractFuzzyMatch";

function testFuzzyMatch(realNumber: string, inferredNumber: string) {
  const goodstring = `Account Number: ${realNumber} - Chequing: $12345.67`
  const match = extractFuzzyMatch(inferredNumber, goodstring);
  expect(match.match).toBe(realNumber);
}

describe('extractFuzzyMatch', () => {
  it('correctly finds a match with masked credit card number', () => {
    testFuzzyMatch("1234 12** **** 1234", "1234 **** 1234")
  })

  it ('handles edge insertions', () => {
    testFuzzyMatch("***1234", "****1234")
  })

  it ('handles edge deletions', () => {
    testFuzzyMatch("***1234", "1234")
  })
})
