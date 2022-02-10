// The eTransfer needs to find a file to read for it's decryption key.
// It's not actually used, so any file will do (ie - this one...)
process.env.USERDATA_INSTRUCTION_PK = __filename;
import { processUnsettledETransfers } from '.'
import { init } from '@thecointech/firestore';
import { GetContract } from '@thecointech/contract-core';
import { getCurrentState } from '@thecointech/tx-statemachine';
import { DateTime } from 'luxon';
import { getFirestore } from '@thecointech/firestore';
import data from './index.test.mockdb.json';

// Allow mocking the decryption fn
import { decryptTo } from '@thecointech/utilities/Encrypt';
import { RbcApi } from '@thecointech/rbcapi';

jest.mock('@thecointech/utilities/Encrypt')
const mockedEncrypt = jest.mocked(decryptTo, false);
jest.setTimeout(900000);

it('Succesfully Processes Sell', async ()=> {
  jest.setTimeout(90000000);
  init(data);

  // Manually convert TS to DateTime.  Must happen after init (it clones db)
  const db = getFirestore();
  const dbdata = (db as any).database as typeof data;
  const ev = dbdata.User[0]._collections.Sell[0];
  ev.date = DateTime.fromMillis(ev.date.seconds * 1000) as any;

  // decryption returns the values spec'ed in our json file.
  mockedEncrypt.mockImplementation(() => {
    return ev.decrypted
  });

  const contract = await GetContract();
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
