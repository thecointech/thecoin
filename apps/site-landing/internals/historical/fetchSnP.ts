import { join } from 'path';
import { readFile, writeFile, utils, WorkSheet, WorkBook } from 'xlsx';
import fetch from 'node-fetch';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';

const outFile = join(__dirname, "..", "..", "src", "containers", "ReturnProfile", "data", "sp500_monthly.csv")

//
// Fetch new data and strip it down ready to upload
export async function updateSnPData() {
  const srcFile = await fetchData();

  const workbook = readFile(srcFile);
  const sheet = "Data";
  cleanData(workbook, sheet);
  writeOutput(workbook, sheet);

  unlinkSync(srcFile);
  return true;
}

async function fetchData() {
  const shillerUrl = "http://www.econ.yale.edu/~shiller/data/ie_data.xls";
  const response = await fetch(shillerUrl);
  const body = await response.buffer();
  const xlsFile = join(tmpdir(), 'ie_data.xls');
  writeFileSync(xlsFile, body);
  return xlsFile;
}

function cleanData(workbook: WorkBook, sheet: string) {
  const data = workbook.Sheets[sheet]

  // Remove weird headers
  delete_row(data, 0, 7);
  // Remove unnecessary data
  delete_col(data, 4, Number.MAX_SAFE_INTEGER)

  // Check we didn't screw up.
  if (data.A1.v != "Date") throw new Error("Woops");

  // Remove current month (it is incomplete) and all trailing rows.
  let i = 1813; // Roughly the end of the sheet at current date (Jan 2022)
  while (data[ec(++i, 2)]) {
    /* do nothing, just count */
  }
  delete_row(data, i - 1, Number.MAX_SAFE_INTEGER);

  // Our date strings get trimmed because the package
  // things it's a regular decimal.  Pad it back out
  let range = utils.decode_range(data["!ref"])
  for (let i = 0; i < range.e.r; i++) {
    const idx = ec(i, 0);
    if (data[idx].t == 'n') {
      data[idx].t = 's'
      data[idx].w = data[idx].w
        .toString()
        .padEnd(7, '0')
        .replace('.', '-');
    }
  }
}

function writeOutput(workbook: WorkBook, sheet: string) {
  writeFile(workbook, outFile, {
    bookType: "csv",
    sheet,
  })
}

const ec = (r: number, c: number) => utils.encode_cell({ r: r, c: c })
const delete_row = (ws: WorkSheet, index: number, count: number) => {
  let range = utils.decode_range(ws["!ref"])
  const delr = Math.min(1 + range.e.r - index, count);
  const maxr = range.e.r - delr;
  for (let R = index; R <= maxr; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      ws[ec(R, C)] = ws[ec(R + count, C)]
    }
  }
  range.e.r = range.e.r - delr;
  ws['!ref'] = utils.encode_range(range.s, range.e)
}
const delete_col = (ws: WorkSheet, index: number, count: number) => {
  let range = utils.decode_range(ws["!ref"])

  const delc = Math.min(1 + range.e.c - index, count);
  const maxc = range.e.c - delc;
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = index; C <= maxc; ++C) {
      ws[ec(R, C)] = ws[ec(R, C + count)]
    }
  }
  range.e.c = range.e.c - delc;
  ws['!ref'] = utils.encode_range(range.s, range.e)
}
