import { getCurrencyConverter, guessCurrencyFormat, guessDateFormat } from './valueParsing';

it ("can guess date format", () => {
  expect(guessDateFormat("Mar 13, 2023")).toBe("MMM d, yy");
  expect(guessDateFormat("Mar 03, 2023")).toBe("MMM d, yy");
  expect(guessDateFormat("March 3")).toBe("MMMM d");
  // TODO: improve ambiguous month/day ordering
  expect(guessDateFormat("1/1/21")).toBe("d/M/yy");
  expect(guessDateFormat("1/1/2021")).toBe("d/M/yy");
  expect(guessDateFormat("01/01/2021")).toBe("d/M/yy");
  // Can only be Jan 13
  expect(guessDateFormat("1/13/2021")).toBe("M/d/yy");
  expect(guessDateFormat("01/13/21")).toBe("M/d/yy");
  // Multiple 'Day' tokens
  expect(guessDateFormat("Wednesday, August 6, 2014")).toBe("EEEE, MMMM d, yy");

  // Test with localization
  expect(guessDateFormat("mai 25 1982", "fr")).toBe("MMM d yy");
  // What happens with no valid date
  expect(guessDateFormat("not a date")).toBeNull();
  expect(guessDateFormat("1/1/202")).toBeNull();
})

it ("can guess currency format", () => {
  expect(guessCurrencyFormat("$ 123.45")).toBe("CAD_en");
  expect(guessCurrencyFormat("123,45 $")).toBe("CAD_fr");
  expect(guessCurrencyFormat("123,45$")).toBe("CAD_fr");
  expect(guessCurrencyFormat("123.123,45$")).toBe("CAD_fr");

  expect(guessCurrencyFormat("($123.45)")).toBe("CAD_en");
  expect(guessCurrencyFormat("$(123.45)")).toBe("CAD_en");

  // Should pass - simple valid cases
  expect(guessCurrencyFormat("$100")).toBe("CAD_en");
  expect(guessCurrencyFormat("100$")).toBe("CAD_fr");
  expect(guessCurrencyFormat("$5CAD")).toBe("CAD_en");
  expect(guessCurrencyFormat("(1234.56)")).toBe("CAD_en");
  expect(guessCurrencyFormat("$3,392.88")).toBe("CAD_en");

  // Should fail - no currency indicators
  expect(guessCurrencyFormat("Account123456789")).toBeNull();
  expect(guessCurrencyFormat("***9949")).toBeNull();
  expect(guessCurrencyFormat("I have 2 puppies")).toBeNull();
  expect(guessCurrencyFormat("Call me at 555-1234")).toBeNull();

  // Should fail - currency buried in long text
  expect(guessCurrencyFormat("Chequing***4567|ChequingAccountBalance$1,234.56")).toBeNull();
  expect(guessCurrencyFormat("This is a very long description with $5 somewhere in it")).toBeNull();

  // Should fail - too many digits (phone numbers, IDs)
  expect(guessCurrencyFormat("12345678901")).toBeNull();
  expect(guessCurrencyFormat("$12345678901")).toBeNull();

  // Should fail - no digits
  expect(guessCurrencyFormat("$")).toBeNull();
  expect(guessCurrencyFormat("()")).toBeNull();

  // Edge cases that should pass
  expect(guessCurrencyFormat("$0.01")).toBe("CAD_en");
  expect(guessCurrencyFormat("$999,999.99")).toBe("CAD_en");
  expect(guessCurrencyFormat("($0.50)")).toBe("CAD_en");
})

it ("parses negative values correctly", () => {
  const cvt = getCurrencyConverter("CAD_en");
  expect(cvt("-123.45").value).toBe(-123.45);
  expect(cvt("($123.45)").value).toBe(-123.45);
  expect(cvt("$(123.45)").value).toBe(-123.45);
})
