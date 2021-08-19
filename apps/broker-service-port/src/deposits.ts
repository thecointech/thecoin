
import { ReconciledRecord } from './types';
import { getBuyETransferAction, eTransferProcessor, manualProcessor, getBuyTypeAction } from '@thecointech/tx-deposit';
import { transitionTo } from '@thecointech/tx-statemachine';
import { Decimal } from 'decimal.js-light';
import { log } from '@thecointech/logging';
import { mockedBank, mockedContract } from './mocks';
import { toDateTime, validate } from './validate';
import { mockMarketStatus, unmockMarketStatus } from './mockMarketStatus';


async function processETransfer(tx: ReconciledRecord) {
  if (tx.email) {
    // The simplest way to drop this into our DB is to run our processor with mocked transactions
    const proc = buildMockedProc(tx);

    // For some actions, we processed the data at a slightly different time than the email arrived.
    if (
      tx.data.hash == '0xd86fc9f1d6de74d7aed819a6f62975c36b60653844c0b176f8a5cff0eec21e43' ||
      tx.data.hash == '0xce088a3abd8d05df326a2b685b5382a1b0d32e6ff4c3e33a4c91d21152a0bb75' ||
      tx.data.hash == "0x9937358e33f2800816da393a4d9d95e39e940b813607a641add27345ccd287af" ||
      tx.data.hash == "0x54db5b86079f98242b3cb47a97740537c7a4212327b74de2c220e45832ba4fae" ||
      tx.data.hash == "0x1df93ca26199cd0d58ee0099a4a6657523ef52ef4ab9d74c9e23630986f69d2b" ||
      tx.data.hash == "0x4c08c35d1bea676ad75920050a95a5d88d05a8a9bdafe3a0fec22fa925eaff12" ||
      tx.data.hash == "0xd6ed55c300d75c3963a59eb23da3634ca03ca3ad88f638e04c4535dc34e8ac50"
    ) {
      tx.email.recieved = tx.blockchain!.date;
    }
    const action = await getBuyETransferAction(tx.email);
    const result = await proc.execute(tx.email, action);

    validate(result, tx);
  }
  else {
    debugger;
  }
}

async function processManual(tx: ReconciledRecord) {

  // Inconsistent FX data caused issues with this deposit.  Fix manually
  if (tx.data.hash == "0xe8250003fe4eab6ea368758e03bb4260575db7057ac6933fafba6df681dee155") {
    tx.data.fiatDisbursed = 100;
    mockMarketStatus(tx.blockchain!.date.toMillis())
  }
  const deposit = {
    fiat: new Decimal(tx.data.fiatDisbursed),
    date: toDateTime(tx.data.recievedTimestamp),
    meta: tx.notes ?? tx.bank[0]?.Description ?? "Ported from old DB",
  }
  const proc = manualProcessor(mockedContract(tx), deposit);

  const action = await getBuyTypeAction(
    tx.data.type ?? "other",
    tx.blockchain!.counterPartyAddress,
    new Decimal(tx.data.fiatDisbursed),
    toDateTime(tx.data.recievedTimestamp)
  );
  const result = await proc.execute(null, action);
  validate(result, tx);
  unmockMarketStatus()
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
