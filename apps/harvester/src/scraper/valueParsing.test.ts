import { guessCurrencyFormat, guessDateFormat } from './valueParsing';

it ("can guess date format", () => {
  expect(guessDateFormat("Mar 13, 2023")).toBe("MMM d, y");
  expect(guessDateFormat("Mar 03, 2023")).toBe("MMM d, y");
  expect(guessDateFormat("March 3")).toBe("MMMM d");
  // TODO: improve ambiguous month/day ordering
  expect(guessDateFormat("1/1/21")).toBe("d/M/y");
  expect(guessDateFormat("1/1/2021")).toBe("d/M/y");
  expect(guessDateFormat("01/01/2021")).toBe("d/M/y");
  // Can only be Jan 13
  expect(guessDateFormat("1/13/2021")).toBe("M/d/y");
  expect(guessDateFormat("01/13/21")).toBe("M/d/y");
  // Multiple 'Day' tokens
  expect(guessDateFormat("Wednesday, August 6, 2014")).toBe("EEEE, MMMM d, y");

  // Test with localization
  expect(guessDateFormat("mai 25 1982", "fr")).toBe("MMM d y");
  // What happens with no valid date
  expect(guessDateFormat("not a date")).toBeNull();

})

it ("can guess currency format", () => {
  expect(guessCurrencyFormat("$ 123.45")).toBe("CAD_en");
  expect(guessCurrencyFormat("123,45 $")).toBe("CAD_fr");
  expect(guessCurrencyFormat("123,45$")).toBe("CAD_fr");
  expect(guessCurrencyFormat("123.123,45$")).toBe("CAD_fr");
})