import currency from 'currency.js';
import { DateTime } from 'luxon';
import type { ValueParsing, ValueType } from '@thecointech/scraper-types';
import { findMaximalCommonSubstrings } from './findSubstrings';


export function getValueParsing(value: string, type: ValueType) {
  return {
    type,
    format: getValueFormat(value, type)
  }
}

export function getValueFormat(value: string, type: ValueType) {
  switch(type) {
    case "date": return guessDateFormat(value);
    case "currency": return guessCurrencyFormat(value);
    case "phone": return guessPhoneFormat(value);
    default: {
      // Text does not have a format
      return null;
    }
  }
}

export function parseValue(value: string, parsing?: ValueParsing) {
  if (value && parsing?.format) {
    switch (parsing?.type) {
      case "date": {
        const d = DateTime.fromFormat(value, parsing.format);
        if (d.isValid) return d;
        break;
      }
      case "currency": {
        const cvt = getCurrencyConverter(parsing.format as CurrencyType);
        return cvt(value);
      }
    }
  }
  return value;
}

const StringTokens = [
  "EEE",
  "EEEE",
  "DDD",
  "MMM",
  "MMMM",
]

// we should refer to user locale when preferring M or d as the first option.
const NumberTokens = [
  "d",  // Matches 3 && 03
  "M",  // Matches 3 && 03
  "yy", // Matches  2 or 4 numbers (eg '21' or '2021')
]
const tokenSplitter = /([0-9a-zA-Z]+)|([^0-9a-zA-Z]+)/gm

const getMatchers = (splits: RegExpMatchArray) => {
  const st = [...StringTokens]
  const nt = [...NumberTokens]
  return splits?.map(v => {
    if (/[0-9]+/.test(v)) return nt;
    if (/[a-zA-Z]+/.test(v)) return st;
    return null;
  })
}

export function guessDateFormat(value?: string, locale?: string) {
  if (!value) return null;
  // split string into tokens of date-kind & separator
  const splits = value.match(tokenSplitter);
  if (!splits) return null;
  // Early-exit, skip all currencies
  if (splits.includes('$')) return null;
  // Search through the splits find potential values vs padding
  const matchers = getMatchers(splits);

  // Recursive generator searches through every variant by level
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function* permutations(tokenMatchers: (string[]|null)[]) : Generator<(string|null)[], void, any> {
    // We search through every variant of the first matcher
    const thisLevel = tokenMatchers[0];
    const rest = tokenMatchers.slice(1);
    // A null entry needs to be preserved, but doesn't
    // consume a match
    if (!thisLevel) {
      if (rest.length) {
        for (const perm of permutations(rest)) {
          yield [null, ...perm];
        }
      }
      return;
    }
    // If we have no potential matchers for this token, this
    // branch of the search is exhuasted
    if (thisLevel.length === 0) {
      return;
    }
    // Each token match should be used only once per format string.
    // This is why all tokens share a copy of the matcher array
    // Once a token is consumed then it is unavailable to all children
    // However, we don't want our childrens consumption to
    // change the matchers we are testing
    const toConsume = [...thisLevel];
    for (const matcher of toConsume) {
      // If we are not the last token, continue searching
      if (rest.length) {
        const remainingMatchers = thisLevel.filter(v => v !== matcher);
        const childMatchers = rest.map(v => v !== thisLevel ? v : remainingMatchers);
        const childPermutations = permutations(childMatchers);
        for (const perm of childPermutations) {
          yield [matcher, ...perm];
        }
      }
      else {
        yield [matcher];
      }
    }
  }

  for (const perm of permutations(matchers)) {
    // Skip branches that never reach the tip
    if (perm.length < matchers.length) {
      continue;
    }
    // Convert to a DateTime-formattable entity
    const candidate = perm?.map((fmt, idx) => {
      if (fmt) return fmt;
      return splits[idx];
    }).join('');
    const dt = DateTime.fromFormat(value, candidate, { locale });
    if (dt.isValid) {
      // Limit to semi-reasonable dates.  This should filter out most of the
      // random number combinations (it's OK if a few get through)
      // (1960 is the 2-digit cutoff year in Luxon)
      if (dt.year > 1960 && dt.year < DateTime.now().year + 2) {
        return candidate;
      };
    }
  }
  return null;
}

const convert = (value: string|undefined, options: currency.Options) => {
  if (!value) return undefined;
  const r = currency(value, options);
  // Do we have a number?
  if (Number.isNaN(r.value)) return undefined;
  // If the number is 0, then it must contain only "0" as it's digits
  if (r.intValue === 0) {
    const digits = value.match(/\d/g);
    if (digits?.length == 0 || digits?.some(d => d !== "0")) {
      return undefined;
    }
  }
  return r;
}

const Currencies = {
  CAD_fr: (value?: string) => convert(value, { symbol: "$", precision: 2, separator: '.', decimal: ',', pattern: '#!'}),
  CAD_en: (value?: string) => convert(value, { symbol: "$", precision: 2 }),
}

export type CurrencyType = keyof typeof Currencies;
export type CurrencyConverter = typeof Currencies["CAD_en"];

export function getCurrencyCandidateValue(value?: string) {
  if (!value) return false;

  const digitCount = (value.match(/\d/g) || []).length;
  // Earliest test, must have at least one digit
  if (digitCount == 0) return false;


  // Pre-validation: must contain currency indicators
  const hasCurrencySymbol = /[\$€£¥₹]/.test(value);
  const hasDecimalPattern = /\d+[.,]\d{2}(?!\d)/.test(value); // Decimal with exactly 2 digits
  const hasThousandsSeparator = /\d{1,3}[,.']\d{3}/.test(value);
  const hasParentheses = /\(\s*\d/.test(value); // Parentheses with digits (negative currency)

  // Must have at least one currency indicator
  if (!hasCurrencySymbol && !hasDecimalPattern && !hasThousandsSeparator && !hasParentheses) {
    return false;
  }

  // If we don't explicitly have a currency symbol, then discard values
  // that are overly-large (eg phone numbers, IDs, etc.)
  if (!hasCurrencySymbol) {
    // Sanity check: we'll probably work with most accounts even if they
    // don't explicitly have a currency symbol anywhere
    if (digitCount > 6) {
      return false;
    }
  }

  // Extract potential currency portion using regex
  // Match patterns like: $123.45, (123.45), 123,45$, $100, etc.
  const currencyPattern = /(?:[-\$€£¥₹(CAD]|\s)*[\d,.']+(?:[\$€£¥₹)CAD]|\s)*/;
  const match = value.match(currencyPattern);

  if (!match) {
    return false;
  }

  const candidateValue = match[0].trim();

  // Reject if the currency portion is too small relative to the full string
  // This assumes we'll never have an instance where the value does not
  // contain it's own element: eg "Balance: $100"
  // This seems reasonable for now, but we may need to adjust
  const lengthRatio = candidateValue.length / value.length;
  if (value.length > 5) {
    if (value.length < 10) {
      // be more lenient for short strings, as the
      // acceptable characters can be a lot higher
      // eg $5CAD has a lot of non-numeric characters
      if (lengthRatio < 0.4) {
        return false;
      }
    }
    else if (lengthRatio < 0.6) {
      return false;
    }
  }

  // Reject if there are too many non-currency characters mixed with digits
  // Allow reasonable currency formatting characters
  const cleanedForValidation = candidateValue.replace(/[\d\$€£¥₹,.'()\s-]/g, '');
  if (cleanedForValidation.length > 3) { // Allow for currency code (CAD)
    return false;
  }

  return candidateValue;
}


export function guessCurrencyFormat(value?: string) : CurrencyType|null {

  // Get the potential currency string
  const candidateValue = getCurrencyCandidateValue(value);
  if (!candidateValue) {
    return null;
  }

  // We most probably have a currency here, now we need to figure
  // out how it's formatted (eg FR vs EN) in order to parse it correctly

  // What is the bare number here?
  const bareNumber = candidateValue.replace(/[^0-9,.$]/g, '');

  // Final test, what kind of currency do we have?
  // By this point, we have validated the currency format
  // now we just need to figure which one it is
  const cadFrResult = Currencies.CAD_fr(bareNumber);
  const cadEnResult = Currencies.CAD_en(bareNumber);

  // Early exits
  if (!cadFrResult && !cadEnResult) {
    return null;
  }
  if (!cadFrResult) {
    return "CAD_en";
  }
  if (!cadEnResult) {
    return "CAD_fr";
  }
  // Just find the closest match
  const frFormat = cadFrResult.format();
  const enFormat = cadEnResult.format();

  const frSimilarity = findMaximalCommonSubstrings(frFormat, bareNumber);
  const enSimilarity = findMaximalCommonSubstrings(enFormat, bareNumber);

  const maxFrStr = frSimilarity.join('');
  const maxEnStr = enSimilarity.join('');

  return maxFrStr.length > maxEnStr.length ? "CAD_fr" : "CAD_en";
}

export function getCurrencyConverter(fmt: CurrencyType): CurrencyConverter {
  return (value?: string) => {
    // Ensure that it's a currency
    // Otherwise pretty much any string will pass.
    const candidateValue = getCurrencyCandidateValue(value);
    if (!candidateValue) {
      return undefined;
    }
    // Return the parsed value
    const converter = Currencies[fmt];
    return converter(candidateValue);
  }
}


// This phone test is very relaxed, it is currently only
// used in estimated runs and the extracted value is not
// used.  It's just a sanity check to make sure we don't
// find a obviously wrong element when searching numbers
export function guessPhoneFormat(value: string) {
  if (!value) return null;

  // 1) Minimum of 2 digits
  const digits = (value.match(/\d/g) || []).length;
  if (digits < 2) {
    return null;
  }

  // 2) Blacklist characters that indicate non-phone content
  if (/[$%]/.test(value)) {
    return null;
  }

  // Remove common phone formatting characters
  const cleaned = value.replace(/[-.\s()+]/g, '');

  // 3) Total length test - reasonable phone number range
  if (cleaned.length < 7 || cleaned.length > 15) {
    return null;
  }

  // Return the cleaned version preserving digits and any masking characters
  return "(phone)";
}
