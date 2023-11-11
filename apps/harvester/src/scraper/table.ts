/* eslint-disable @typescript-eslint/no-explicit-any */
import currency from 'currency.js';
import { DateTime } from 'luxon';
import { Page, } from 'puppeteer';
import { Coords, Font } from './types';
import { getCurrencyConverter, guessCurrencyFormat, guessDateFormat } from './valueParsing';

export type HistoryRow = {
  date: DateTime,
  description: string,
  debit?: currency,
  credit?: currency,
  balance?: currency,
}

export async function getTableData(page: Page, font: Font) {
  const rawText = await getTextNodeData(page);
  const rawRows = findTableRows(rawText, font);
  const table = lineUpColumns(rawRows);
  console.table(table);

  return mapColumnsToTypes(table);
}

type RawText = { text: string, bbox: Coords, style: Font }

const groupBy = <T>(array: T[], predicate: (value: T, index: number, array: T[]) => string|number) =>
  array.reduce((acc, value, index, array) => {
    (acc[predicate(value, index, array)] ||= []).push(value);
    return acc;
  }, {} as { [key: string]: T[] });

export function findTableRows(rawText: RawText[], style: Font) {
  // group all content into rows
  const rows = groupBy(rawText, el => el.bbox.top);
  // Get rid of all the rows at y==0 (eg style tags etc)
  // delete rows['0'];
  // remove all rows that are too small (we need 3 at least)
  const tableRows = Object.entries(rows).filter(r => r[1].length > 2).slice(1);
  const tables = groupBy(tableRows, row => row[1][0].bbox.left);
  const sortedtables = Object.entries(tables).sort((l, r) => r[1].length - l[1].length);

  const allMatches = sortedtables.map(([ , rows]) => {
    // find all rows with at least a date & currency
    const txrows = rows.filter(row => 
      row[1].find(entry => guessDateFormat(entry.text)) &&
      row[1].find(entry => guessCurrencyFormat(entry.text))
    );
    // only use rows that match the given style
    const matches = txrows.filter(row => 
      row[1][0].style.color === style.color &&
      row[1][0].style.size === style.size &&
      row[1][0].style.style === style.style
    );
    return matches;
  });
  // Return the tables with the most matches
  allMatches.sort((a, b) => b.length - a.length);
  return allMatches[0].map(row => row[1]);
}

// For now, we assume [DateTime, desc, debit, credit, balance]
function mapColumnsToTypes(rows: string[][]) : HistoryRow[] {
  const [dateCol, dateMapping] = guessDateColumn(rows[0]);
  const [_, currencyMapping] = guessCurrencyColumn(rows[0]);

  return rows.map(row => ({
    date: DateTime.fromFormat(row[dateCol], dateMapping),
    description: row[1],
    debit: currencyMapping(row[2]),
    credit: currencyMapping(row[3]),
    balance: currencyMapping(row[4]),
  }))
}

function guessDateColumn(row: string[]): [number, string] {
  for (let i = 0; i < row.length; i++) {
    const fmt = guessDateFormat(row[i]);
    if (fmt) {
      return [i, fmt];
    }
  }

  throw new Error("Couldn't guess date column");
}

function guessCurrencyColumn(row: string[]): [number, (value: string) => currency] {
  for (let i = row.length - 1; i >= 0; --i) {
    const fmt = guessCurrencyFormat(row[i]);
    if (fmt) {
      return [i, getCurrencyConverter(fmt)];
    }
  }

  throw new Error("Couldn't guess date column");
}


export function lineUpColumns(rawRows: RawText[][]) {
  const allColumnStarts = new Set(rawRows.flatMap(row => row.map(entry => entry.bbox.left)));
  const columnEntries = Object.fromEntries(
    [...allColumnStarts].sort((a, b) => a - b).map((v, i) => [v, i])
  );
  const tabulised = rawRows.reduce((table, row) => {
    const newRow: string[] = [];
    row.forEach(entry => {
      newRow[columnEntries[entry.bbox.left]] = entry.text;
    })
    table.push(newRow);
    return table;
  }, [] as string[][]);
  return tabulised;
}

async function getTextNodeData(page: Page) : Promise<RawText[]> {
  const allText = await page.$x('//*/text()');
  return page.evaluate((...allText) => {
    console.log(allText);
    const withcontent = allText.filter((el: any) => 
      el.parentNode &&
      el.parentNode.checkVisibility({
        checkOpacity: true,  // Check CSS opacity property too
        checkVisibilityCSS: true // Check CSS visibility property too
      }) &&
      !!el.textContent.replace(/\s+/, ''));

    // get document coordinates of the element
    const getCoords = (elem: any) => {
      return {
        top: elem.offsetTop,
        left: elem.offsetLeft,
        height: elem.offsetHeight,
        width: elem.offsetWidth,
      };
    }
    const getFontData = (elem: any) => {
      const styles = getComputedStyle(elem.parentNode);
      return {
        font: styles.font,
        color: styles.color,
        size: styles.fontSize,
        style: styles.fontStyle,
      }
    }

    return withcontent.map((el: any) => ({
      text: el.textContent,
      bbox: getCoords(el),
      style: getFontData(el),
    }))
  }, ...allText)
}