import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ContractCore } from "@thecointech/contract-core";
import { calculateTxBalances, loadAndMergeHistory, type Transaction } from "@thecointech/tx-blockchain";
import { fetchRate, type FXRate } from "@thecointech/fx-rates";
import { toHuman } from "@thecointech/utilities";
import { DateTime } from "luxon";
import { writeFile } from 'fs/promises';

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 <address> --from=YY-MM --to=YY-MM')
  .command('$0 <address>', 'Export transactions for an address', (yargs) => {
    return yargs.positional('address', {
      describe: 'Account address',
      type: 'string',
    });
  })
  .parseSync();

const address = argv.address as string | undefined;
if (!address) {
  console.error("Error: address is required");
  process.exit(1);
}

const tc = await ContractCore.get();
const currentBalance = await tc.balanceOf(address);
const history = await loadAndMergeHistory(0, tc, address);

const fetchedRates = new Map<number, FXRate>();

async function getRate(date: DateTime): Promise<FXRate> {
  const key = date.startOf('day').toMillis();
  let rate = fetchedRates.get(key);
  if (!rate) {
    const fetched = await fetchRate(date.toJSDate());
    if (!fetched || !fetched.validFrom) {
      throw new Error(`No rate found for ${date.toFormat('yyyy-MM-dd')}`);
    }
    rate = fetched;
    fetchedRates.set(key, rate);
  }
  return rate;
}

function cadRate(rate: FXRate, isBuy: boolean): number {
  return isBuy
    ? rate.buy * rate.fxRate
    : rate.sell * rate.fxRate;
}

const withRates = await Promise.all(history.map(async (tx) => {
  const rate = await getRate(tx.date);
  const changeCad = toHuman(
    cadRate(rate, tx.change > 0) * tx.change
  );

  return {
    ...tx,
    CAD: changeCad,
  };
}));

// Output as CSV
const outFile = "transactions.csv";
const csvRows = withRates.map(tx => {
  return `${tx.date.toFormat('yyyy-MM-dd')},${tx.timestamp},${tx.from},${tx.to},${tx.change},${tx.CAD},${tx.fee ?? 0},${tx.txHash}`;
}).join('\n');
await writeFile(outFile, `Date,timestamp,From,To,Change,CAD,Fee,txHash\n${csvRows}`);


