
import { jest } from '@jest/globals';
import { init } from '@thecointech/firestore';
import { ConnectContract } from '@thecointech/contract-core';
import { getCurrentState } from '@thecointech/tx-statemachine';
import { DateTime } from 'luxon';
import { getFirestore } from '@thecointech/firestore';
import data from './index.test.mockdb.json' assert {type: "json"};
import { RbcApi } from '@thecointech/rbcapi';
import { getSigner } from '@thecointech/signers';

let ev: any = undefined;
jest.unstable_mockModule('@thecointech/utilities/Encrypt', () => ({
  GetHash: () => "12345678901234567890123456789012",
  decryptTo: jest.fn().mockImplementation(() => ev.decrypted),
  encrypt: jest.fn(),
}));

const { processUnsettledETransfers } = await import('.');
jest.setTimeout(90000000);

it('Succesfully Processes Sell', async ()=> {
  init(data);

  // Manually convert TS to DateTime.  Must happen after init (it clones db)
  const db = getFirestore();
  const dbdata = (db as any).database as typeof data;
  ev = dbdata.User[0]._collections.Sell[0];
  ev.date = DateTime.fromMillis(ev.date.seconds * 1000) as any;

  const signer = await getSigner("BrokerTransferAssistant")
  const contract = await ConnectContract(signer);
  const bank = new RbcApi();
  const eTransfers = await processUnsettledETransfers(contract, bank);

  const results = eTransfers.map(getCurrentState);
  for (const result of results)
  {
    expect(result.name).toEqual("complete");
    expect(result.data.hash).toBeTruthy();
    expect(result.data.fiat?.isZero()).toBeTruthy();
    expect(result.data.coin?.isZero()).toBeTruthy();
  }
})
