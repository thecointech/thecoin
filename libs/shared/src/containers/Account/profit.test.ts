import { calculateProfit, fiatChange, totalCad, currentValue, filterFees } from "./profit";
import { toHuman } from "@thecointech/utilities";
import { SimpleTransactions, SimpleRates, ExampleTransactions, ExampleRates } from "./profit.data.test";

test("Calculate simple profit correctly", () => {
  const change = fiatChange(SimpleTransactions[0], SimpleRates);
  const hchange = toHuman(change);
  expect(hchange).toBe(5);

  const withdrawal = fiatChange(SimpleTransactions[3], SimpleRates);
  const hwithdrawal = toHuman(withdrawal);
  expect(hwithdrawal).toBe(-2.5);

  // What is the total CAD we have put into this account?
  // 5 + 10 - 5 - 2.5 = 7.5
  const totalCAD = totalCad(SimpleTransactions, SimpleRates);
  expect(totalCAD).toBe(7.5);

  const currentCoin = SimpleTransactions[3].balance;
  const balanceCAD = currentValue(currentCoin, SimpleRates);
  expect(balanceCAD).toBe(12.5);

  const profitCAD = calculateProfit(currentCoin, SimpleTransactions, SimpleRates)
  expect(profitCAD).toBe(5);
});

const roundDecimalPlaces = (val: number) => Math.round(val * 100) / 100;
test('calculate real profit correctly', () => {

  const txs = ExampleTransactions;
  const rates = ExampleRates.sort((a, b) => a.validTill - b.validTill);

  const {balance} = txs[0];

  var txInFiat = txs
    .filter(filterFees)
    .map(tx => fiatChange(tx, rates))
    .map(fiat => toHuman(fiat, true));

  // Initial deposit, $1000
  let tx1 = fiatChange(txs[5], rates);
  tx1 = toHuman(tx1, true);
  expect(tx1).toBe(1000);
  expect(tx1).toBe(txInFiat[3]);

  // Next two withdraw $10 each (tx 3 & 1 are 10c fee and ignored here)
  let tx2 = fiatChange(txs[4], rates);
  tx2 = toHuman(tx2, true);
  expect(tx2).toBe(-10);
  let tx3 = fiatChange(txs[2], rates);
  tx3 = toHuman(tx3, true);
  expect(tx3).toBe(-10);

  // Final transfer from 3rd party of $1818.66
  let tx4 = fiatChange(txs[0], rates);
  tx4 = toHuman(tx4, true);
  expect(tx4).toBe(1818.66);

  // costBasis is just the sum of deposits minus withdrawals
  // cost basis = (in - out) $2818.66 - $20 = 2798.66
  const costBasisA = txInFiat.reduce((a, b) => a + b, 0);
  expect(costBasisA).toBe(2798.66);
  const costBasisB = totalCad(txs, rates);
  // We _need_ to port to decimal
  expect(costBasisA).toEqual(roundDecimalPlaces(costBasisB));

  // Whats the current balance?
  const balanceCAD = roundDecimalPlaces(currentValue(balance, rates));
  expect(balanceCAD).toBe(2859.91);


  // profit = balance - costBasis = 2859.91 - 2798.66 = 61.25
  const profit = roundDecimalPlaces(calculateProfit(balance, txs, rates));
  expect(profit).toBe(61.25);

});

