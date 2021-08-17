import { ReconciledRecord } from './types';
import { getBuyETransferAction, eTransferProcessor, manualProcessor, getBuyTypeAction } from '@thecointech/tx-deposit';
import { transitionTo } from '@thecointech/tx-statemachine';
import { DateTime } from 'luxon';
import { Decimal } from 'decimal.js-light';
import { log } from '@thecointech/logging';
import { mockedBank, mockedContract } from './mocks';
import { toDateTime, validate } from './validate';


async function processETransfer(tx: ReconciledRecord) {
  if (tx.email) {
    // The simplest way to drop this into our DB is to run our processor with mocked transactions
    const proc = buildMockedProc(tx);
    const action = await getBuyETransferAction(tx.email);
    const result = await proc.execute(tx.email, action);
    validate(result, tx);
  }
  else {
    debugger;
  }
}

async function processManual(tx: ReconciledRecord) {

  const deposit = {
    fiat: new Decimal(tx.data.fiatDisbursed),
    date: toDateTime(tx.data.recievedTimestamp!),
    meta: tx.notes ?? tx.bank[0]?.Description ?? "Ported from old DB",
  }
  const proc = manualProcessor(mockedContract(tx), deposit);
  // proc.graph.deposited.next = transitionTo<any, "Buy">(mockToCoin(tx), "converted");
  const action = await getBuyTypeAction(
    tx.data.type ?? "other",
    tx.blockchain!.counterPartyAddress,
    new Decimal(tx.data.fiatDisbursed),
    DateTime.fromMillis(tx.data.recievedTimestamp.toMillis())
  );
  const result = await proc.execute(null, action);
  validate(result, tx);
}

export async function updateDeposit(tx: ReconciledRecord) {
  // If we don't have a hash, we didn't complete
  if (!tx.data.hash) {
    log.debug(`Skipping Buy from ${tx.data.recievedTimestamp.toDate()} of $${tx.data.fiatDisbursed}`)
    if (tx.data.sourceId != "CAcgWksG") {
      debugger;
    }
    return;
  }
  if (tx.refund) {
    // What do we do with refunded purchases?
    // Just ignore them
    return;
  }
  const type = tx.data.type ?? (tx.email || tx.bank[0]?.Description ? "etransfer" : "other");
  switch (type) {
    case "etransfer":
      await processETransfer(tx);
      break;
    case "deposit": // manual bank deposit.
    case "other": // exclusively wages paid until now
      await processManual(tx);
      break;
    default:
      throw new Error(`Unknown purchase type: ${tx.data.type}`);
  }

}

function buildMockedProc(tx: ReconciledRecord) {
  // re-process the tx, without actually putting any changes into bank/contract
  const rbcApi = mockedBank(tx);
  const contract = mockedContract(tx);
  const proc = eTransferProcessor(contract, rbcApi);

  const labelEmailETransfer = () => Promise.resolve({})
  proc.graph.initial.next = transitionTo<any, "Buy">(labelEmailETransfer, "labelledETransfer");
  const labelEmailDeposited = () => Promise.resolve({})
  proc.graph.depositResult.next = transitionTo<any, "Buy">(labelEmailDeposited, "deposited");

  return proc;
}
