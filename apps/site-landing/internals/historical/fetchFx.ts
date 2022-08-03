import { join } from 'path';
import fetch from 'node-fetch';
import { writeFileSync, readFileSync } from 'fs';
import papaparse from 'papaparse';
import lodash from 'lodash';
import { DateTime } from 'luxon';
import { isPresent } from '@thecointech/utilities/ArrayExtns';

const staticFile = new URL("CADUSD_historical.csv", import.meta.url);
const bocRates = "https://www.bankofcanada.ca/valet/observations/group/FX_RATES_MONTHLY/csv?start_date=2017-01-01";

const outFile = new URL(join("..", "..", "src", "containers", "BenefitsSimulator", "simulator", "fx_monthly.csv"), import.meta.url);

//
// Fetch new data and strip it down ready to upload
export async function updateFxData() {
  const archivedLines = getStatic();
  const liveLines = await getLive();
  // Remove duplicates
  const xOverDate = '2017-01';
  const archXOverIdx = archivedLines.findIndex(l => l.startsWith(xOverDate));
  const liveXOverIdx = liveLines.findIndex(l => l.startsWith(xOverDate));
  if (archXOverIdx < 0 || liveXOverIdx < 0)
    throw new Error("No point putting a real message here, because it will never happen");

  writeFileSync(outFile, [
    "Date,Fx",
    ...archivedLines.slice(0, archXOverIdx),
    ...liveLines.slice(liveXOverIdx),
  ].join('\n'));
  return true;
}

function getStatic() {
  const raw = readFileSync(staticFile, "utf8");
  const archived = papaparse.parse(raw);
  const data: string[][] = archived.data;

  const dates = data[9];
  const rates = data[11];
  return lodash.zip(dates, rates).slice(1).map(([date, rate]) => {
    const dt = DateTime.fromFormat(date!, "MMMM yyyy");
    return `${dt.toFormat("yyyy-LL")},${rate}`;
  });
}

async function getLive() {
  const response = await fetch(bocRates, undefined);
  const raw = await response.text();
  const live = papaparse.parse(raw);
  const data: string[][] = live.data;
  return data
    .slice(40)
    .map(row => {
      const date = row[0];
      const rate = row[25];
      if (!rate) return null;
      // Strip trailing day (these are avg monthly values)
      const datestr = date.substring(0, 7);
      return `${datestr},${rate}`;
    })
    .filter(isPresent)
}
