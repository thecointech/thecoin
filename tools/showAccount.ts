import { ContractCore } from "@thecointech/contract-core";
import { calculateTxBalances, loadAndMergeHistory } from "@thecointech/tx-blockchain";
import { fetchRate } from "@thecointech/fx-rates";
import { toHuman } from "@thecointech/utilities";
import { DateTime } from "luxon";

const address = process.argv[2];
if (!address) {
  throw new Error("Usage: showAccount <address>");
}

const tc = await ContractCore.get();
const balance = await tc.balanceOf(address);
const history = await loadAndMergeHistory(0, tc, address);

if (history.length === 0) {
  console.log(`No transaction history found for ${address}`);
  process.exit(0);
}

const fetchedRates: Array<{ validFrom: number; validTill: number; sell: number; fxRate: number }> = [];
async function getRateForDate(date: DateTime) {
  const ts = date.toMillis();
  let rate = fetchedRates.find(r => r.validFrom <= ts && r.validTill > ts);
  if (!rate) {
    const fetched = await fetchRate(date.toJSDate());
    if (fetched) {
      rate = fetched;
      fetchedRates.push(rate);
    }
  }
  return rate ? rate.sell * rate.fxRate : 0;
}

const currentRate = await fetchRate();
const currentRateCAD = currentRate ? currentRate.sell * currentRate.fxRate : 0;

calculateTxBalances(balance, history);

const rows = [] as Array<{
  date: string;
  change: string;
  balanceCoin: string;
  balanceCAD: string;
  txHash: string;
}>;
for (const tx of history) {
  const rateCAD = await getRateForDate(tx.date);
  rows.push({
    date: tx.date.toFormat("yyyy-MM-dd HH:mm"),
    change: `${toHuman(tx.change * rateCAD, true).toFixed(2)}`,
    balanceCoin: `${toHuman(tx.balance, true).toFixed(2)}`,
    balanceCAD: rateCAD > 0 ? `${toHuman(tx.balance * rateCAD, true).toFixed(2)}` : "N/A",
    txHash: tx.txHash,
  });
}

console.log(`\nAccount history for ${address} (${rows.length} transactions):\n`);
console.table(rows);

const currentBalanceCoin = toHuman(Number(balance), true);
const currentBalanceCAD = currentRateCAD > 0 ? toHuman(Number(balance) * currentRateCAD, true) : 0;
console.log(`\nCurrent balance: ${currentBalanceCoin.toFixed(2)} Coin (${currentBalanceCAD.toFixed(2)} CAD)`);
