import {join} from 'path';
import { readFile, writeFile, utils, WorkSheet } from 'xlsx';

const ec = (r: number, c: number) => utils.encode_cell({r:r,c:c})

const delete_row = (ws: WorkSheet, index: number, count: number) => {
  let range = utils.decode_range(ws["!ref"])
  const delr = Math.min(range.e.r - index, count);
  const maxr = range.e.c - delr;
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

  const delc = Math.min(range.e.c - index, count);
  const maxc = range.e.c - delc;
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = index; C <= maxc; ++C) {
      ws[ec(R, C)] = ws[ec(R, C + count)]
    }
  }
  range.e.c = range.e.c - delc;
  ws['!ref'] = utils.encode_range(range.s, range.e)
}

const srcFile = join(__dirname, 'ie_data.xls');
const outFile = join(__dirname, "..", "src", "sp500_monthly.csv")
const workbook = readFile(srcFile);
const data = workbook.Sheets["Data"]

// Remove weird headers
delete_row(data, 0, 7);
// Remove unnecessary data
delete_col(data, 9, 100)
delete_col(data, 5, 2)
delete_col(data, 1, 3)

// Check we didn't screw up.
if (data.A1.v != "Date") throw new Error("Woops");

// Remove current month (it is incomplete) and all trailing rows.
let i = 1813;
while (data[ec(++i, 3)]) {}
delete_row(data, i - 1, Number.MAX_SAFE_INTEGER);


writeFile(workbook, outFile, {
  bookType: "csv",
  sheet: "Data",
})

