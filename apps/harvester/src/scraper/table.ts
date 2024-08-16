/* eslint-disable @typescript-eslint/no-explicit-any */
import currency from 'currency.js';
import { DateTime } from 'luxon';
import { Page, } from 'puppeteer';
import { ElementData, Font } from './types';
import { getCurrencyConverter, guessCurrencyFormat, guessDateFormat } from './valueParsing';
import { getAllElements } from './elements';
import { log } from '@thecointech/logging';

export type HistoryRow = {
  date: DateTime,
  description: string,
  debit?: currency,
  credit?: currency,
  balance?: currency,
}

export async function getTableData(page: Page, font: Font) {
  const rawText = await getTextNodeData(page);
  const rawTable = getRawTable(rawText);
  return mapColumnsToTypes(rawTable);
}

const groupBy = <T>(array: T[], predicate: (value: T, index: number, array: T[]) => string|number) =>
  array.reduce((acc, value, index, array) => {
    (acc[predicate(value, index, array)] ||= []).push(value);
    return acc;
  }, {} as { [key: string]: T[] });

export function getRawTable(rawText: ElementData[]) : string[][] {
  // group all content into rows
  const rows = groupBy(rawText, el => el.coords.centerY);
  // remove all rows that are too small (we need 3 at least)
  const tableRows = Object.entries(rows).filter(r => r[1].length > 2);
  // Ensure their in the right order
  const sortedTableRows = tableRows.sort((a, b) => a[1][0].coords.centerY - b[1][0].coords.centerY);
  const tables = groupBy(sortedTableRows, row => row[1][0].coords.left);
  const sortedtables = Object.entries(tables).sort((l, r) => r[1].length - l[1].length);

  const allMatches = sortedtables.map(([ , rows]) => {
    // Now match up all the columns
    const columns: ColumnData[] = getRawColumns(rows);
    // We may have picked up a number of tables with slightly varying columns
    // (ie, multiple tables grouping transactions).
    // Our next step is to merge overlapping columns together where appropriate
    const mergedColumns = mergeColumns(columns);
    // data is organized, but we understand it much better in table form
    // Turn it back into a 2D array
    return columnsToTable(mergedColumns, rows.length);
  });
  // Return the tables with the most matches
  allMatches.sort((a, b) => b.length - a.length);
  return allMatches[0];
}

type ColumnData = {
  left: number,
  right: number,
  entries: ElementData[],
}

function columnsToTable(columns: ColumnData[], numRows: number) {
  const rowsAligned = new Array(numRows);
  for (let i = 0; i < numRows; i++) {
    rowsAligned[i] = new Array(columns.length);
    for (let j = 0; j < columns.length; j++) {
      rowsAligned[i][j] = columns[j].entries[i]?.text;
    }
  }
  return rowsAligned;
}

function getRawColumns(rows: [string, ElementData[]][]) {
  const columns: ColumnData[] = [];
  // Map rows into their appropriate columns
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (const el of row[1]) {
      // Add this element to it's column
      const elRight = Math.round(el.coords.left + el.coords.width);
      const column = getColumn(columns, el.coords.left, elRight);
      column.entries[i] = el;
    }
  }
  return columns.sort((a, b) => a.left - b.left);
}

function mergeColumns(columns: ColumnData[]) {
  const mergedColumns = [];
  for (let i = 0; i < columns.length - 1; i++) {
    // Does this column overlap with the next one?
    const l = columns[i];
    const r = columns[i + 1];

    const merged = getMergedColumn(l, r);
    if (merged) {
      // If the columns were merged, we replace R with the
      // merged column and re-run the merge again. This
      // way we can merge multiple columns together
      columns[i + 1] = merged;
    }
    else {
      mergedColumns.push(l);
    }
  }
  // The last column may not have been merged
  mergedColumns.push(columns[columns.length - 1]);
  return mergedColumns;
}

function getMergedColumn(l: ColumnData, r: ColumnData) {
  const overlap = Math.max(0, Math.min(l.right, r.right) - l.left);
  if (overlap / (l.right - l.left) > 0.75) {
    // no value overlap
    const newEntries = new Array(Math.max(l.entries.length, r.entries.length));
    for (let j = 0; j < newEntries.length; j++) {
      // If both columns have entries, they cannot be merged
      if (l.entries[j] && r.entries[j]) {
        return false;
      }
      newEntries[j] = l.entries[j] || r.entries[j];
    }
    return {
      left: l.left,
      right: r.right,
      entries: newEntries
    };
  }
  return false;
}

function getColumn(columns: ColumnData[], left: number, right: number) {
  const column = columns.find(c => c.left == left || c.right == right);
  if (column) {
    column.right = Math.max(column.right, right);
    return column;
  }

  // Create a new column
  const newIdx = columns.push({
    left: left,
    right: right,
    entries: []
  });
  return columns[newIdx - 1];
}

type HistoryRowPartial = Partial<HistoryRow> & { row: string[] };

// For now, we assume [DateTime, desc, debit, credit, balance]
function mapColumnsToTypes(rows: string[][]) : HistoryRow[] {
  const processing = rows.map<HistoryRowPartial>(r => ({ row: r }));
  const withDates = processDates(processing);
  const withValues = processCurrencies(withDates);

  return withValues;
}

function getCurrencyFormat(processing: HistoryRowPartial[]) {
  for (let i = 0; i < processing.length - 1; i++) {
    const row = processing[i].row;
    for (let j = 0; j < row.length; j++) {
      const format = guessCurrencyFormat(row[j]);
      if (format) return format
    }
  }
  throw new Error(`Couldn't find any currencies in rows`);
}

function processDates(processing: HistoryRowPartial[]) {
  const fmt = findDateFormat(processing);
  // Find all valid dates
  const allDates = processing.map(r => {
    return r.row.map(v => v ? DateTime.fromFormat(v, fmt) : undefined)
  });
  // Count how many dates are in each column
  const colsWithDate = allDates.reduce((acc, row) => {
    return row.map((cell, i) => (cell?.isValid ? 1 : 0) + (acc[i] || 0))
  }, [] as number[]);
  // The date column should have the most dates in it
  const max = Math.max(...colsWithDate)
  if (max == 0) throw new Error("No dates found");
  const rowIdx = colsWithDate.indexOf(max);

  // Assign date to processing
  const assigned = processing.map((r, i) => {
    const d = allDates[i][rowIdx];
    // If the row has a value, but it isn't a date, remove it.
    if (!d?.isValid) return null;
    // Assign and remove from row
    r.date = d;
    r.row.splice(rowIdx, 1);
    return r;
  })

  const filtered = assigned.filter(r => !!r);
  // enforce earliest => latest ordering
  const firstDate = filtered.find(r => r.date)?.date;
  const lastDate = [...filtered].reverse().find(r => r.date)?.date;
  // This should never happen (we should have thrown already)
  if (!firstDate || !lastDate) throw new Error("No dates found");
  // ensure array is descending (first date at end)
  const sorted = (firstDate < lastDate) ? filtered.reverse() : filtered;
  return sorted;
}

function findDateFormat(processing: HistoryRowPartial[]) {
  // Search the first 5 rows for a date
  for (let i = 0; i < processing.length; i++) {
    const row = processing[i].row;
    for (let j = 0; j < row.length; j++) {
      const fmt = guessDateFormat(row[j]);
      if (fmt) {
        log.info(`Found date format ${fmt} from ${row[j]}`);
        return fmt;
      }
    }
  }
  throw new Error("Date format not guessed");
}

function processCurrencies(processing: HistoryRowPartial[]) {
  const fmt = getCurrencyFormat(processing);
  const converter = getCurrencyConverter(fmt);
  const allCurrencies = processing.map(r => r.row.map(converter));
  // Count how many currencies are in each column
  const currencyCounts = allCurrencies.reduce((acc, row) => {
    return row.map((cell, i) => (cell ? 1 : 0) + (acc[i] || 0))
  }, [] as number[]);

  // The last column should be balance
  const colBalance = currencyCounts.findLastIndex(c => c > 0);

  // Now, we need to figure out debit/credit columns
  // Get our first & last balances
  const firstBalanceRow = allCurrencies.findIndex(r => r[colBalance]);
  const lastBalanceRow = allCurrencies.findLastIndex(r => r[colBalance]);
  const rowsToTest = allCurrencies.slice(firstBalanceRow, lastBalanceRow + 1);

  // enumerate all possible combinations of debit/credit
  const combos = [] as [number, number][];

  for (let cidx = 0; cidx < currencyCounts.length; cidx++) {
    if (currencyCounts[cidx] === 0 || cidx === colBalance) continue;
    for (let didx = cidx + 1; didx < currencyCounts.length; didx++) {
      if (currencyCounts[didx] === 0 || didx === colBalance) continue;
      combos.push([cidx, didx]);
      combos.push([didx, cidx]);
    }
  }

  const matches = getMatchesForCombos(combos, rowsToTest, colBalance);
  const scores = matches.map(m => {
    return m.filter(r => r.credit || r.debit).length
  })
  const maxScore = Math.max(...scores);
  const bestResults = matches[scores.indexOf(maxScore)];

  // copy back to processing
  return processing.map<HistoryRow>((r, i) => ({
    date: r.date!,
    description: r.row[0],
    credit: bestResults[i - firstBalanceRow]?.credit,
    debit: bestResults[i - firstBalanceRow]?.debit,
    balance: bestResults[i - firstBalanceRow]?.balance,
  }))
}

function getMatchesForCombos(combos: [number, number][], rowsToTest: (currency|undefined)[][], balanceColumn: number) {
  const results = [];
  for (const combo of combos) {
    results.push(findColumnMatches(combo[0], combo[1], balanceColumn, rowsToTest, false));
    results.push(findColumnMatches(combo[0], combo[1], balanceColumn, rowsToTest, true));
  }
  return results;
}

function findColumnMatches(credit: number, debit: number, colBalance: number, rows: (currency|undefined)[][], negate: boolean) {
  const lastRow = rows[rows.length - 1];
  let lastBalance = lastRow[colBalance]!;
  // We initialize with the values in the last row
  // This is because there is no preceding balance
  // so we cannot know if they are correct or not,
  // so we just assume they are and incorrect indices will be ignored
  const matched = [{
    credit: negate ? lastRow[credit]?.multiply(-1) : lastRow[credit],
    debit: lastRow[debit],
    balance: lastRow[colBalance],
  }];
  const blockMatched = [];
  for (let i = rows.length - 2; i >= 0; i--) {
    const currentCredit = negate ? rows[i][credit]?.multiply(-1) : rows[i][credit];
    const currentDebit = rows[i][debit];
    const testBalance = lastBalance.add(currentCredit ?? 0).add(currentDebit ?? 0)

    const newBalance = rows[i][colBalance];
    if (newBalance) {
      // If we have a balance, check it against the official total
      // If it matches, copy the matched values into the full total
      if (testBalance.value === newBalance.value) {
        matched.push(...blockMatched, {credit: currentCredit, debit: currentDebit, balance: testBalance});
      }
      else {
        // It doesn't match, but matched needs to have an
        // entry for every entry in rows, so push empty values
        matched.length += blockMatched.length + 1;
      }
      blockMatched.length = 0;
      lastBalance = testBalance;
    }
    else {
      // Not every row has a balance,
      // in this case we keep a running count
      blockMatched.push({credit: currentCredit, debit: currentDebit, balance: testBalance});
      lastBalance = testBalance
    }
  }
  // We reverse-iterate to fill this, so reverse the result back to original order
  return matched.reverse();
}

async function getTextNodeData(page: Page) : Promise<ElementData[]> {
  const allElements = await getAllElements(page);
  return allElements
    .filter(el => el.data.nodeValue)
    .map(se => se.data)
}
