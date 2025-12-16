import { DateTime } from 'luxon';
import type { Page } from 'puppeteer';
import { type CurrencyType, getCurrencyConverter, guessCurrencyFormat, guessDateFormat } from '../valueParsing';
import { getAllElements } from '../elements';
import currency from 'currency.js';
import type { HistoryRow, ElementData } from '@thecointech/scraper-types';

export async function getTableData(page: Page) {
  const rawText = await getTextNodeData(page);
  const rawTable = getRawTxData(rawText);
  return rawTable;
}

const groupBy = <T, Key extends string|number>(array: T[], predicate: (value: T, index: number, array: T[]) => Key) =>
  array.reduce((acc, value, index, array) => {
    (acc[predicate(value, index, array)] ||= []).push(value);
    return acc;
  }, [] as Record<Key, T[]>);

// I can't get 100% reliable table detection to work
// It's not important for now, so just return all rows
// and let the caller deal with it

export function getRawTxData(rawText: ElementData[]) : HistoryRow[] {

  // Get all dates as LH columns
  const allDates = getAllDates(rawText);
  const dateColumns = groupBy(allDates, el => el.raw.coords.left);

  // Get all currencies as RH columns
  const allCurrencies = getAllCurrencies(rawText);
  // const currencyColumns = groupBy(allCurrencies, el => el.raw.coords.left + el.raw.coords.width);

  // Find the best date column.
  const dates = Object.entries(dateColumns).sort((a, b) => b[1].length - a[1].length);
  const dateCol = dates[0][1].sort((a, b) => a.raw.coords.centerY - b.raw.coords.centerY);
  const firstDate = dateCol[0];

  // Get all elements that are below-right of this point
  const allElements = [...allDates, ...allCurrencies];
  const smallestHeight = Math.min(...allElements.map(el => el.raw.coords.height));

  // This is the top-left of the table(s)
  const topLeftCoords = firstDate.raw.coords;
  const top = topLeftCoords.top - smallestHeight; // Allow some offset
  const left = topLeftCoords.left;;
  const bounded = allElements.filter(el => (
    el.raw.coords.left >= left &&
    el.raw.coords.centerY >= top
  )).sort((a, b) => a.raw.coords.centerY - b.raw.coords.centerY);

  // Group into rows
  const rows = groupBy(bounded, el => el.raw.coords.centerY);

  // We don't care what the data -is-.  We just need the date & value
  // Return all currencies associated with the nearest date
  return Object.entries(rows)
    .map(([centerY, row]) => {
      // Compare vs center to ensure we don't get thrown by small differences in top
      const dateDistances = dateCol.map(el => Math.abs(el.raw.coords.centerY - Number(centerY)));
      const closestIdx = indexOfMinValue(dateDistances);
      const date = dateCol[closestIdx];

      const currencies = row.filter(el => Object.hasOwn(el, "currency")) as typeof allCurrencies;
      return { date: date.date, values: currencies.map(el => el.currency) };
    })
    .sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

function indexOfMinValue(arr: number[]) {
  if (arr.length === 0) {
    return -1;
  }
  let min = arr[0];
  let minIndex = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) {
      minIndex = i;
      min = arr[i];
    }
  }
  return minIndex;
}

function getAllDates(rawText: ElementData[]) {
  const dateFmts: Record<string, number> = {}
  for (const row of rawText) {
    const fmt = guessDateFormat(row.text)
    if (fmt) {
      dateFmts[fmt] = (dateFmts[fmt] || 0) + 1;
    }
  }
  // Find the record with the most matches
  const entries = Object.entries(dateFmts);
  if (entries.length === 0) {
    throw new Error(`Couldn't find any dates in rows`);
  };
  const [fmt] = entries.sort((a, b) => b[1] - a[1])[0];
  // Now return all dates that can be converted to this format
  return rawText
    .map(el => ({
      date: DateTime.fromFormat(el.text, fmt),
      raw: el
    }))
    .filter(el => el.date.isValid)
}

// Find all the nodes that contain a currency
function getAllCurrencies(rawText: ElementData[]) {
  const currencyFmts: Record<CurrencyType, number> = {
    CAD_en: 0,
    CAD_fr: 0
  }
  for (const row of rawText) {
    const fmt = guessCurrencyFormat(row.text)
    if (fmt) {
      currencyFmts[fmt] = currencyFmts[fmt] + 1;
    }
  }
  // Find the record with the most matches
  const fmt = currencyFmts['CAD_en'] > currencyFmts['CAD_fr'] ? 'CAD_en' : 'CAD_fr';
  if (currencyFmts[fmt] === 0) {
    throw new Error(`Couldn't find any currencies in rows`);
  };
  // Now return all currencies that can be converted to this format
  const converter = getCurrencyConverter(fmt);
  return rawText
    .map(el => ({
      currency: converter(el.text),
      raw: el
    }))
    .filter(el => el.currency)
    .map(el => {
      return { currency: currency(Math.abs(el.currency!.value)), raw: el.raw }
    })
}

async function getTextNodeData(page: Page) : Promise<ElementData[]> {
  const allElements = await getAllElements(page, Number.MAX_SAFE_INTEGER);
  return allElements
    .filter(el => el.data.nodeValue)
    .map(se => se.data)
}
