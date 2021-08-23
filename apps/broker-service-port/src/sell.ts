import { mockedBank, mockedContract } from './mocks';
import { ReconciledRecord } from './types';
import { getSellAction, Processor } from '@thecointech/tx-etransfer';
import { CertifiedTransfer, ETransferPacket } from '@thecointech/types';
import { toDateTime, validate } from './validate';
import { readFileSync } from 'fs';
import { decryptTo } from "@thecointech/utilities/Encrypt";
import { SellActionContainer, transitionTo } from '@thecointech/tx-statemachine';
import { depositCoin as oldDeposit } from '@thecointech/tx-statemachine/transitions';
import { Decimal } from 'decimal.js-light';
import { mockMarketStatus, unmockMarketStatus } from './mockMarketStatus';

// We mock the instruction - even though we have a decoded version
// because some of the instructions were invalid but we fixed them manually
const mockInstruction = {
  email: "email@email",
  question: "question",
  answer: "answer",
  message: "optinoal",
}

const pk = readFileSync(process.env.USERDATA_INSTRUCTION_PK!).toString();

// async function processManual(tx: ReconciledRecord) {

//   console.log(tx.notes);
//   const proc = buildMockedProc(tx);
//   const action = await getSellAction(tx.data as any);
//   const result = await proc.execute(mockInstruction, action);
//   validate(result, tx);
// }

export async function updateSell(tx: ReconciledRecord) {
  // The simplest way to drop this into our DB is to run our processor with mocked transactions

  const instructions = getInstructions(tx);
  if (tx.refund) {
    if (
      tx.data.hash != "0xcc86bfb3ec0702ba999f308ea975e0ac73dc5e640e78a176267eed2723a9ea7e" &&
      tx.data.hash != "0xb0644af4c3d64077e102020f1ec5a6496d0290bfff3987eebd0dbdf59a17e46e" &&
      tx.data.hash != "0xab38262081326e427e8d1532c1d2bbedfe4b157f77b3a1210f22c85ac73597a8" &&
      tx.data.hash != "0xea8a7a736f2373e58329dc7a7fe9be753c1e75095d2d48d895efa64ab8e29b22" &&
      tx.data.hash != "0x060b10d13539d5c245969ef18b5353584fe39eb6d6fe7cec62cd4c761bee47ab"
    ) {
      // Refunds will be ignored (for now)
      debugger;
    }
    return;
  }
  if (!tx.data.fiatDisbursed) {
    if (tx.data.hash != "0x58831f8d8ce372d38378aca8bb90dd8ba85ba913c22fcb75f3551881d5001fd8")
    {
      const hash = Number(tx.data.hash);
      if (!(hash > 1500000000000 && hash < 1650000000000))
      {
        // Incomplete transfers don't need to be recorded.
        debugger;
      }
      return;
    }
  }
  if (!instructions) {
    console.log(tx.notes);
    if (
      tx.data.hash != "0x17f14b5018a503fe8b154b6e583da53e5f29268dce4c7d0737346faae7deb794" &&
      tx.data.hash != "0x5c5c79c76f79bfaeb4759e6924c7cf868179852168f9ab2880d5e0436ce3c341" &&
      tx.data.hash != 'CLOSE ACCOUNT:0x1198AACEF87B53CA5610C68FD83DF9577D54CC0C' &&
      tx.data.hash != "CLOSE ACCOUNT:0xD86C97292B9BE3A91BD8279F114752248B80E8C5" &&
      tx.data.hash != "0xc8c23a1912d5cf733274ad7b3db93665cf4b742838459edf6ff799b240f1639b" &&
      tx.notes != "e-Transfers were completed without a working admin app, this amount is less than stated in DB but balances the earlier ones" &&
      tx.notes != "e-Transfers were completed without a working admin app, so amount was guestimated and does not match src"
    ) {
      debugger;
    }
  }
  await processETransfer(tx);
}

async function processETransfer(tx: ReconciledRecord) {
  const proc = buildMockedProc(tx);
  const sale = tx.data as any;
  // For manual sales, there may be no signature
  if (!sale.signature) {
    sale.signature = sale.hash
  }


  const oldToCoin = proc.graph.tcResult.next;

  // Strip all other data than what we want.
  const initial: any = {};
  if (sale.transfer) { initial.transfer = sale.transfer };
  if (sale.instructionPacket) { initial.instructionPacket = sale.instructionPacket };
  if (sale.signature) { initial.signature = sale.signature };

  // The following transactions somehow completed at their recieved time, not at their processedTime
  if (
    tx.data.hash == 'CLOSE ACCOUNT:0x1198AACEF87B53CA5610C68FD83DF9577D54CC0C' ||
    tx.data.hash == '0xfd16ab4b51e196d400f4987b35a19f5656f8afb2c98a195833d747895b770666' ||
    tx.data.hash == '0x7d2a89aa68ebb0a33c7608202af54450d672ad923a002386f55d6963a82f7366' ||
    tx.data.hash == '0x78d5f91534accebb66d36ce4d681bf5bbbae5a20ac1d1c2cfebbfaba33c8ef60' ||
    (
      tx.data.completedTimestamp && tx.data.processedTimestamp &&
      tx.data.completedTimestamp!.toMillis() < tx.data.processedTimestamp!.toMillis()
    )
  ) {
    mockMarketStatus(tx.data.completedTimestamp!.toMillis());
  }

  else if (
    // Unknown why this doesn't match.
    tx.data.hash == "CLOSE ACCOUNT:0xD86C97292B9BE3A91BD8279F114752248B80E8C5" ||
    // tx.data.hash == '0xfd16ab4b51e196d400f4987b35a19f5656f8afb2c98a195833d747895b770666' ||
    // tx.data.hash == '0x7d2a89aa68ebb0a33c7608202af54450d672ad923a002386f55d6963a82f7366' ||
    // tx.data.hash == '0x78d5f91534accebb66d36ce4d681bf5bbbae5a20ac1d1c2cfebbfaba33c8ef60' ||
      // The following transactions were done manually and settled for the wrong price
    tx.notes == "e-Transfers were completed without a working admin app, so amount was guestimated and does not match src" ||
    tx.notes == "e-Transfers were completed without a working admin app, this amount is less than stated in DB but balances the earlier ones" ||
    tx.data.hash == '0x5c5c79c76f79bfaeb4759e6924c7cf868179852168f9ab2880d5e0436ce3c341'
  ) {
    const toFiat = () => Promise.resolve({
      date: tx.blockchain!.date,
      coin: new Decimal(0),
      fiat: new Decimal(tx.data.fiatDisbursed),
    })
    proc.graph.tcResult.next = transitionTo<any, "Sell">(toFiat, "converted")
  }

  const action = await getSellAction(initial, toDateTime(tx.data.recievedTimestamp));
  const result = await proc.execute(mockInstruction, action);

  // always reset the open timestamp
  unmockMarketStatus();
  proc.graph.tcResult.next = oldToCoin;

  validate(result, tx);

}

function buildMockedProc(tx: ReconciledRecord) {
  const rbcApi = mockedBank(tx);
  const contract = mockedContract(tx);

  // We also override the following functions
  const proc = Processor(contract, rbcApi);
  if (tx.notes) {
    const depositCoin = async (container: SellActionContainer) => {
      return {
        ...await oldDeposit(container),
        meta: tx.notes,
      }
    }
    proc.graph.tcReady.next = transitionTo<any, "Sell">(depositCoin, "tcWaiting");
  }
  return proc;
}

function getInstructions(tx: ReconciledRecord) {
  const xfer = tx.data as unknown as CertifiedTransfer;
  if (!xfer.instructionPacket) return null;
  const instructions = decryptTo<ETransferPacket>(pk, xfer.instructionPacket);
  if (!instructions) {
    // we are in trouble...
    debugger;
    throw new Error("shizzle")
  }
  return instructions;
}

