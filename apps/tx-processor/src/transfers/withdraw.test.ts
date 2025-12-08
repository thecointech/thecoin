import { jest } from '@jest/globals';
import { init } from '@thecointech/firestore';
import { ContractCore } from '@thecointech/contract-core';
import { getCurrentState } from '@thecointech/tx-statemachine';
import { DateTime } from 'luxon';
import { getFirestore } from '@thecointech/firestore';
import data from './withdraw.test.mockdb.json' with { type: "json" }
import { RbcApi } from '@thecointech/rbcapi';
import { getSigner } from '@thecointech/signers';

let ev: any = undefined;
jest.unstable_mockModule('@thecointech/utilities/Encrypt', () => ({
  encrypt: jest.fn(),
}));
jest.unstable_mockModule('@thecointech/utilities/Decrypt', () => ({
  GetHash: () => "12345678901234567890123456789012",
  decryptTo: jest.fn().mockImplementation(() => ev.decrypted),
}));

jest.unstable_mockModule('@thecointech/tx-gmail', () => ({
  queryNewDepositEmails: jest.fn().mockReturnValue([]),
  setETransferLabel: jest.fn(),
}));

const { processTransfers } = await import('.');
jest.setTimeout(90000000);

it('Succesfully Processes Sell', async ()=> {
  init(data);
  // Manually convert TS to DateTime.  Must happen after init (it clones db)
  const db = getFirestore();
  const dbdata = (db as any).database as typeof data;
  ev = dbdata.User[0]._collections.Sell[0];
  ev.date = DateTime.fromMillis(ev.date.seconds * 1000) as any;
  ev.initial.transfer.to = process.env.WALLET_BrokerCAD_ADDRESS;

  const signer = await getSigner("BrokerTransferAssistant");
  const contract = await ContractCore.connect(signer);
  const bank = await RbcApi.create();
  const eTransfers = await processTransfers(contract, bank);

  for (const xfer of eTransfers)
  {
    const result = getCurrentState(xfer);

    expect(result.name).toEqual("complete");
    // A hash should be set and the cleared in the subsequent wait
    expect(xfer.history.filter(d => d.delta.hash).length).toBe(1)
    expect(result.data.fiat?.isZero()).toBeTruthy();
    expect(result.data.coin?.isZero()).toBeTruthy();
  }
})
