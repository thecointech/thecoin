import { extractFuzzyMatch } from "./extractFuzzyMatch";

it('correctly finds a match', () => {
  const realNumber = "1234567890";
  const goodstring = `Account Number: ${realNumber} - Chequing: $12345.67`
  const inferredNumber = "124507890" // Off by a few digits


  const match = extractFuzzyMatch(inferredNumber, goodstring);
  expect(match).toBe(realNumber)
})
