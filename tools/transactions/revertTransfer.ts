import { ContractCore } from "@thecointech/contract-core";
import { getActionsForAddress, storeTransition, type SellAction } from '@thecointech/broker-db';
import { init, getFirestore } from '@thecointech/firestore';
import { DateTime } from 'luxon';

// Args - hash of transaction to revert, date revert happens on
const hash = process.argv[2];
const revertDate = process.argv[3];
if (!hash) {
  throw new Error("No transaction hash specified");
}
if (!revertDate) {
  throw new Error("No revert date specified");
}
const returnDate = DateTime.fromSQL(revertDate);
if (!returnDate.isValid) {
  throw new Error(`Invalid revert date: ${revertDate}`);
}


async function main() {
  const address = await getUserAddress(hash);
  const action = await getUserAction(address, hash);

  if (!action) {
    throw new Error(`No action found for address ${address} and hash ${hash}`);
  }

  const withFiat = action.history.map(delta => delta.fiat);
  const amounts = withFiat.filter(f => f?.gt(0));
  if (amounts.length != 1) {
    throw new Error(`Expected exactly one fiat amount for action ${action.data.initialId}, got ${amounts.length}`);
  }

  const history = action.history.map(h => h.type);

  console.log(`\n--- Revert ${action.type} Transfer ---`);
  console.log(`  Hash:      ${hash}`);
  console.log(`  From:      ${address}`);
  console.log(`  On:        ${action.data.date.toSQLDate()}`);
  console.log(`  Amount:    ${amounts[0]}`);
  console.log(`  History:   ${history.join(", ")}`);

  await checkProceed();

  console.log("Reverting transfer...");
  await insertReturnedETransfer(action, returnDate);
  console.log("Done. The processor will now revert the e-Transfer back to coin.");
}

async function insertReturnedETransfer(action: SellAction, returnDate: DateTime) {
  // Get the history subcollection docs
  throw new Error("Check Implementation - this was created for a specific use case, and needs updating to generalize");
  const historySnapshot = await action.doc.collection("History").get();
  const historyDocs = [...historySnapshot.docs]
    .sort((a, b) => a.data().created.toMillis() - b.data().created.toMillis());

  // Find the last markComplete transition
  const markCompleteIndex = historyDocs
    .map((d, i) => ({ type: d.data().type, i }))
    .filter(d => d.type === "markComplete")
    .at(-1)?.i;
  if (markCompleteIndex === undefined) {
    throw new Error("No markComplete transition found in history; cannot revert");
  }

  // Remove the markComplete transition so the action is no longer complete
  await historyDocs[markCompleteIndex].ref.delete();

  // Inject a waitETransfer transition with the returned error.
  // The state machine will be in eTransferComplete and route through handleWaitError.
  await storeTransition(action.doc, {
    type: "waitETransfer",
    created: DateTime.now(),
    date: returnDate,
    error: "etransfer: returned",
  });

  // Re-add the action to the incomplete list so the processor will pick it up
  const incompleteRef = getFirestore().collection(action.type).doc();
  await incompleteRef.set({ ref: action.doc as any });
}

async function checkProceed() {
  const answer = await new Promise<string>(resolve => {
    process.stdout.write(`Proceed? (y/n) `);
    process.stdin.once('data', data => resolve(data.toString().trim().toLowerCase()));
  });
  if (answer !== 'y') {
    console.log("Skipped.");
    process.stdin.destroy();
    process.exit(0);
  }
}


async function getUserAction(user: string, hash: string) {
  const allEntries = await getActionsForAddress(user, "Sell");
  const matching = allEntries.filter(action => 
    action.history.filter(h => h.hash == hash).length > 0
  );
  if (matching.length !== 1) {
    throw new Error(`Expected exactly one action for hash ${hash}, got ${matching.length}`);
  }
  return matching[0];
}

async function getUserAddress(hash: string) {
  // First, get the tx receipt for the action
  const tcCore = await ContractCore.get();

  const provider = tcCore.runner?.provider;
  if (!provider) {
    throw new Error("No provider connected");
  }
  const txReceipt = await provider.getTransactionReceipt(hash);
  if (!txReceipt) {
    throw new Error(`Transaction not found: ${hash}`);
  }

  const exactTransfers = txReceipt.logs
    .map(log => {
      try { return tcCore.interface.parseLog(log); }
      catch { return null; }
    })
    .filter(p => p?.name === "ExactTransfer");

  if (exactTransfers.length !== 1) {
    throw new Error(`${exactTransfers.length} ExactTransfer events found in transaction ${hash}`);
  }

  const exactTransfer = exactTransfers[0];
  
  return exactTransfer!.args.from as string;
}

await init({ service: "BrokerServiceAccount" });

await main();