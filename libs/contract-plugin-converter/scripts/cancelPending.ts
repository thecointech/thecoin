import { getSigner } from '@thecointech/signers';
import { ContractConverter } from '../src';

//
// One-off script to fix a double-run on the testdemoaccount.
//
const owner = await getSigner("Owner");
const converter = await ContractConverter.connect(owner);

const from = process.env.WALLET_TestDemoAccount_ADDRESS!;
const to = process.env.WALLET_BrokerCAD_ADDRESS!;
// time of double-billing
const msTime = 1790571600000;
const amount = 140000n;          // fiat amount in the contract's units (e.g. 175.00 -> 17500)

const pending = await converter.pendingAmount(from, to, msTime);
console.log('Pending amount:', pending);

const pendingTotal = await converter.pendingTotal(from);
console.log('Pending total:', pendingTotal);

if (pendingTotal > amount) {
  const toCancel = pendingTotal - amount;
  const tx = await converter.cancelPending(from, to, msTime, toCancel);
  await tx.wait();
  console.log(`cancel ${toCancel} Pending mined:`, tx.hash);
} else {
  console.log(`Pending amount ${pendingTotal} in valid range`);
}
