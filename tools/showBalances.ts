import { GetContract } from "@thecointech/contract-core";
import { loadAndMergeHistory } from "@thecointech/tx-blockchain";
import { fetchRate } from "@thecointech/fx-rates";
import { toHuman } from "@thecointech/utilities";

const tc = await GetContract();
const history = await loadAndMergeHistory(0, tc);
const rate = await fetchRate();

// Extract all unique addresses from transaction history
const addresses = new Set<string>();
for (const tx of history) {
  if (tx.from) addresses.add(tx.from);
  if (tx.to) addresses.add(tx.to);
}

console.log(`Found ${addresses.size} unique addresses in transaction history`);

// Query balance for each address
const balances: Array<{ address: string; balance: bigint; balanceCAD: number }> = [];

const rateCAD = rate!.sell * rate!.fxRate;
for (const address of addresses) {
  const balance = await tc.balanceOf(address);
  if (balance > 0n) {
    // Convert from atomic units to CAD (assuming 6 decimals)
    const balanceCAD = toHuman(Number(balance) * rateCAD, true);
    balances.push({ address, balance, balanceCAD });
  }
}

// Sort by balance descending
balances.sort((a, b) => Number(b.balanceCAD - a.balanceCAD));

console.log(`\nAddresses with balances (${balances.length} total):\n`);
for (const { address, balance, balanceCAD } of balances) {
  console.log(`${address}: ${balanceCAD.toFixed(2)} CAD (${balance} atomic units)`);
}

// Summary
const totalBalance = balances.reduce((sum, { balance }) => sum + balance, 0n);
const totalCAD = toHuman(Number(totalBalance) * rateCAD, true);
console.log(`\nTotal balance across all addresses: ${totalCAD.toFixed(2)} CAD`);


