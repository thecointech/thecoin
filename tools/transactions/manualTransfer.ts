import { Wallet } from 'ethers'
import { readFileSync } from 'fs'
import { BuildVerifiedXfer } from '@thecointech/utilities/VerifiedTransfer'
import { ContractCore } from '@thecointech/contract-core';
import { getSigner } from '@thecointech/signers';
import { fetchRate } from '@thecointech/fx-rates';
import { toCoinDecimal } from '@thecointech/utilities';
import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';
import type { XferRequest } from './types';

const xferPath = process.argv[2];
if (!xferPath) {
  throw new Error("No transfer file specified");
}
const xferRequest = JSON.parse(readFileSync(xferPath, 'utf-8')) as XferRequest;
const signerRaw = readFileSync(xferRequest.wallet, 'utf-8')
const password = await new Promise<string>(resolve => {
  process.stdout.write('Wallet password: ');
  process.stdin.once('data', data => resolve(data.toString().trim()));
});
const signer = Wallet.fromEncryptedJsonSync(signerRaw, password);
const date = DateTime.fromSQL(xferRequest.date);

const xferAssist = await getSigner("BrokerTransferAssistant")
const contract = await ContractCore.connect(xferAssist);
const balance = await contract.balanceOf(signer.address);
console.log("Balance:", balance.toString());

// Convert fiat -> coin
const rate = await fetchRate(date.toJSDate());
if (!rate) {
  throw new Error("Failed to fetch rate");
}

const transfers = xferRequest.transfers.map(t => ({
  to: t.to,
  fiat: t.fiat,
  coin: toCoinDecimal(
    new Decimal(t.fiat)
    .div(rate.fxRate * rate.sell) // the rate we sell at
  )
}))
const total = transfers.reduce((acc, t) => acc.plus(t.coin), new Decimal(0));

// Do we have enough balance?
if (total.greaterThan(Number(balance))) {
  throw new Error("Not enough balance");
}
console.log("Remaining after all transfers:", Number(balance) - total.toNumber());

// Override timestamp
let millis = date.toMillis() + 1000;
Date.now = () => millis;
for (const t of transfers) {
  const xfer = await BuildVerifiedXfer(signer, t.to, t.coin.toNumber(), 0);

  const balanceFrom = await contract.balanceOf(signer.address);
  const balanceTo = await contract.balanceOf(t.to);
  console.log(`\n--- Transfer ---`);
  console.log(`  From:      ${signer.address} (balance: ${balanceFrom})`);
  console.log(`  To:        ${t.to} (balance: ${balanceTo})`);
  console.log(`  Amount:    ${t.coin.toNumber()} (fiat: $${t.fiat})`);
  console.log(`  Timestamp: ${xfer.timestamp} (match: ${millis === xfer.timestamp})`);

  const answer = await new Promise<string>(resolve => {
    process.stdout.write(`Proceed? (y/n) `);
    process.stdin.once('data', data => resolve(data.toString().trim().toLowerCase()));
  });
  if (answer !== 'y') {
    console.log("Skipped.");
    continue;
  }

  const r = await contract.certifiedTransfer(
    xfer.chainId,
    xfer.from,
    xfer.to,
    xfer.value,
    xfer.fee,
    xfer.timestamp,
    xfer.signature,
  );
  const receipt = await r.wait();
  console.log("Sent:", receipt?.hash);

  // We can't send two transfers at the same timestamp, so increment it
  millis = millis + 1000;
}

process.stdin.destroy();
