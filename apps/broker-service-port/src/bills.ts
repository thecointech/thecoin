import { mockedBank, mockedContract } from './mocks';
import { ReconciledRecord } from './types';
import { getBillAction, Processor } from '@thecointech/tx-bill';
import { toDateTime, validate } from './validate';
import { transitionTo } from '@thecointech/tx-statemachine';
import { Decimal } from 'decimal.js-light';


export async function updateBill(tx: ReconciledRecord) {
  // The simplest way to drop this into our DB is to run our processor with mocked transactions

  if (!tx.database || !tx.bank[0]) {
    // we are in trouble...
    debugger;
    throw new Error("shizzle")
  }

  if (tx.refund) {
    debugger;
    throw new Error("shizzle");
  }

  const proc = buildMockedProc(tx);
  const bill = tx.data as any;
  const initial: any = {};
  if (bill.transfer) { initial.transfer = bill.transfer };
  if (bill.instructionPacket) { initial.instructionPacket = bill.instructionPacket };
  if (bill.signature) { initial.signature = bill.signature };

  const action = await getBillAction(initial);
  const result = await proc.execute(null, action);
  validate(result, tx);
}

function buildMockedProc(tx: ReconciledRecord) {
  const rbcApi = mockedBank(tx);
  const contract = mockedContract(tx);

  // We also override the following functions
  const date = tx.data.completedTimestamp
    ? toDateTime(tx.data.completedTimestamp)
    : tx.bank[0].Date
  const proc = Processor(contract, rbcApi);
  const payBill = () => Promise.resolve({
    fiat: new Decimal(0),
    date,
    meta: tx.notes ?? tx.bank[0].Description ?? "Manual port from old DB"
  })
  proc.graph.billReady.next = transitionTo<any, "Bill">(payBill, "billResult");
  return proc;
}
