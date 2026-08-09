//
//  Calculate the legal profit for a given period using ACB
//
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ContractCore } from "@thecointech/contract-core";
import { calculateTxBalances, loadAndMergeHistory, Transaction } from "@thecointech/tx-blockchain";
import { fetchRate, FXRate } from "@thecointech/fx-rates";
import { toHuman } from "@thecointech/utilities";
import { DateTime } from "luxon";

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 <address> --from=YY-MM --to=YY-MM')
  .option('from', {
    alias: 'f',
    describe: 'Start month (inclusive), format YY-MM',
    type: 'string',
    demandOption: true,
  })
  .option('to', {
    alias: 't',
    describe: 'End month (inclusive), format YY-MM',
    type: 'string',
    demandOption: true,
  })
  .parseSync();

const address = argv._[0] as string | undefined;
if (!address) {
  console.error("Error: address is required");
  process.exit(1);
}

function parseMonth(arg: string): DateTime {
  const dt = DateTime.fromFormat(arg, 'yy-MM');
  if (!dt.isValid) {
    throw new Error(`Invalid month format: ${arg}. Expected YY-MM`);
  }
  return dt;
}

const fromDate = parseMonth(argv.from).startOf('month');
const toDate = parseMonth(argv.to).endOf('month');

if (fromDate > toDate) {
  throw new Error(`From date ${fromDate.toFormat('yyyy-MM-dd')} is after to date ${toDate.toFormat('yyyy-MM-dd')}`);
}

const tc = await ContractCore.get();
const currentBalance = await tc.balanceOf(address);
const history = await loadAndMergeHistory(0, tc, address);

if (!history || history.length === 0) {
  console.log(`No transaction history found for ${address}`);
  process.exit(0);
}

// Fees are paid to the broker transfer assistant and do not affect the client's ACB.
const isNotFee = (tx: Transaction) => tx.to !== process.env.WALLET_BrokerTransferAssistant_ADDRESS;

const filteredHistory = history.filter(isNotFee);
if (filteredHistory.length === 0) {
  console.log(`No fee-filtered transaction history found for ${address}`);
  process.exit(0);
}

calculateTxBalances(currentBalance, filteredHistory);

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

function cadRate(rate: FXRate, side: 'buy' | 'sell'): number {
  return side === 'buy'
    ? rate.buy * rate.fxRate
    : rate.sell * rate.fxRate;
}

type Row = {
  date: string;
  type: string;
  changeCoin: string;
  rateCAD: string;
  cadValue: string;
  acbImpact: string;
  runningACB: string;
  runningCoin: string;
};

const rows: Row[] = [];
let acb = 0;
let coinBalance = 0;
let openingACB = 0;
let openingCoin = 0;
let openingSet = false;
let periodAcquisitions = 0;
let periodProceeds = 0;
let periodGainLoss = 0;

for (const tx of filteredHistory) {
  if (tx.change === 0) continue;

  const inPeriod = tx.date >= fromDate && tx.date <= toDate;
  if (!openingSet && inPeriod) {
    openingACB = acb;
    openingCoin = coinBalance;
    openingSet = true;
  }

  const rate = await getRate(tx.date);
  const coinChange = toHuman(tx.change, false);

  if (coinChange > 0) {
    const rateCAD = cadRate(rate, 'sell');
    const cost = coinChange * rateCAD;
    acb += cost;
    coinBalance += coinChange;

    if (inPeriod) {
      periodAcquisitions += cost;
      rows.push({
        date: tx.date.toFormat('yyyy-MM-dd HH:mm'),
        type: 'Acquire',
        changeCoin: `+${coinChange.toFixed(6)}`,
        rateCAD: rateCAD.toFixed(4),
        cadValue: cost.toFixed(2),
        acbImpact: `+${cost.toFixed(2)}`,
        runningACB: acb.toFixed(2),
        runningCoin: coinBalance.toFixed(6),
      });
    }
  } else {
    const disposedCoin = Math.abs(coinChange);
    const rateCAD = cadRate(rate, 'buy');
    const acbPerCoin = coinBalance > 0 ? acb / coinBalance : 0;
    const disposedACB = disposedCoin * acbPerCoin;
    const proceeds = disposedCoin * rateCAD;
    const gainLoss = proceeds - disposedACB;

    acb -= disposedACB;
    coinBalance -= disposedCoin;

    if (inPeriod) {
      periodProceeds += proceeds;
      periodGainLoss += gainLoss;
      rows.push({
        date: tx.date.toFormat('yyyy-MM-dd HH:mm'),
        type: 'Dispose',
        changeCoin: `-${disposedCoin.toFixed(6)}`,
        rateCAD: rateCAD.toFixed(4),
        cadValue: proceeds.toFixed(2),
        acbImpact: `-${disposedACB.toFixed(2)}`,
        runningACB: acb.toFixed(2),
        runningCoin: coinBalance.toFixed(6),
      });
    }
  }
}

if (!openingSet) {
  openingACB = acb;
  openingCoin = coinBalance;
}

console.log(`\nACB report for ${address}`);
console.log(`Period: ${fromDate.toFormat('yyyy-MM-dd')} to ${toDate.toFormat('yyyy-MM-dd')} (inclusive)`);
console.log(`Fee-filtered transactions in period: ${rows.length}\n`);

if (rows.length > 0) {
  console.table(rows);
}

console.log(`\nOpening ACB: ${openingACB.toFixed(2)} CAD (${openingCoin.toFixed(6)} coin)`);
console.log(`Closing ACB: ${acb.toFixed(2)} CAD (${coinBalance.toFixed(6)} coin)`);
console.log(`Total acquisitions (cost): ${periodAcquisitions.toFixed(2)} CAD`);
console.log(`Total dispositions (proceeds): ${periodProceeds.toFixed(2)} CAD`);
console.log(`Net capital gain/loss: ${periodGainLoss.toFixed(2)} CAD`);
