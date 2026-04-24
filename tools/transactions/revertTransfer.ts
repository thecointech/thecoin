import { Wallet } from 'ethers';
import { readFileSync } from 'fs';
import { getSigner } from "@thecointech/signers";
import { ContractCore } from "@thecointech/contract-core";
import { fetchRate } from '@thecointech/fx-rates';
import { toCoinDecimal } from '@thecointech/utilities';
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';

// Read the same transfer file used by manualTransfer.ts
const xferPath = process.argv[2];
if (!xferPath) {
  throw new Error("No transfer file specified");
}
const xferRequest = JSON.parse(readFileSync(xferPath, 'utf-8'));
const signerRaw = readFileSync(xferRequest.wallet, 'utf-8');
const signer = Wallet.fromEncryptedJsonSync(signerRaw, xferRequest.password);
const date = DateTime.fromSQL(xferRequest.date);

const rate = await fetchRate(date.toJSDate());
if (!rate) {
  throw new Error("Failed to fetch rate");
}
// revertTransfer requires THECOIN_ROLE (DEFAULT_ADMIN_ROLE)
const owner = await getSigner("TheCoin");
const contract = await ContractCore.connect(owner);

const transfers = xferRequest.transfers.map((t: { to: string; fiat: number }) => ({
  from: t.to,
  to: signer.address,
  coin: toCoinDecimal(
    new Decimal(t.fiat)
      .div(rate.fxRate * rate.sell)
  ),
  fiat: t.fiat,
}));

for (const t of transfers) {
  const amount = t.coin.toNumber();
  const balanceFrom = await contract.balanceOf(t.from);
  const balanceTo = await contract.balanceOf(t.to);

  console.log(`\n--- Revert Transfer ---`);
  console.log(`  From:   ${t.from} (balance: ${balanceFrom})`);
  console.log(`  To:     ${t.to} (balance: ${balanceTo})`);
  console.log(`  Amount: ${amount} (fiat: $${t.fiat})`);

  const answer = await new Promise<string>(resolve => {
    process.stdout.write(`Proceed? (y/n) `);
    process.stdin.once('data', data => resolve(data.toString().trim().toLowerCase()));
  });
  if (answer !== 'y') {
    console.log("Skipped.");
    continue;
  }

  const tx = await contract.revertTransfer(t.from, t.to, amount, Date.now());
  const receipt = await tx.wait();
  console.log("Reverted:", receipt?.hash);

  const balanceFromAfter = await contract.balanceOf(t.from);
  const balanceToAfter = await contract.balanceOf(t.to);
  console.log(`  From balance: ${balanceFrom} -> ${balanceFromAfter}`);
  console.log(`  To balance:   ${balanceTo} -> ${balanceToAfter}`);
}

process.stdin.destroy();
