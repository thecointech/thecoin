import currency from 'currency.js';
import { DateTime } from 'luxon';
import { ValueType } from './types';


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
    default: {
      // Text does not have a format
      return null;
    }
  }
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
  "y",  // Matches  1-6 numbers
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

export function guessDateFormat(value: string, locale?: string) {
  // split string into tokens of date-kind & separator
  const splits = value.match(tokenSplitter);
  if (!splits) return null;
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
      return candidate;
    }
  }
  return null;
}

const Currencies = {
  CAD_fr: (value: string) => currency(value, { symbol: "$", precision: 2, separator: '.', decimal: ',', pattern: '#!'}),
  CAD_en: (value: string) => currency(value, { symbol: "$", precision: 2 }),
}

export type CurrencyType = keyof typeof Currencies;

export function guessCurrencyFormat(value: string) : CurrencyType|null {
  // What is the bare number here?
  const bareCents = value.replace(/[^0-9]/g, '');
  // strip out additional spaces
  const noSpace = value.replace(/\s/g, '');
  if (Currencies.CAD_fr(noSpace).format({ symbol: '', separator: '', decimal: ''}) === bareCents)
    return "CAD_fr";
  if (Currencies.CAD_en(noSpace).format({ symbol: '', separator: '', decimal: ''}) === bareCents)
    return "CAD_en";
  return null;
}

export function getCurrencyConverter(fmt: CurrencyType) {
  return Currencies[fmt];
}