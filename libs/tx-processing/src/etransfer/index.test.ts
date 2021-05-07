// The eTransfer needs to find a file to read for it's decryption key.
// It's not actually used, so any file will do (ie - this one...)
process.env.DB_ACTION_PK_PATH = __filename;

import { processUnsettledETransfers } from '.'
import { init } from '@thecointech/firestore/mock';

import data from './service.test.mockdb.json';
import { GetContract } from '@thecointech/contract';
import { getCurrentState } from '../statemachine/types';
import { DateTime } from 'luxon';
import { getFirestore } from '@thecointech/firestore';

// Allow mocking the decryption fn
import { decryptTo } from '@thecointech/utilities/Encrypt';
import { mocked } from 'ts-jest/utils';
jest.mock('@thecointech/utilities/Encrypt')
const mockedEncrypt = mocked(decryptTo, false);

it('Succesfully Processes Sell', async ()=> {
  jest.setTimeout(90000000);
  init(data);

  // Manually convert timestamps.  To be removed once conversion
  // happens cleanly in broker-db.  Must happen after init (it clones db)
  const db = getFirestore();
  const dbdata = (db as any).database as typeof data;
  const ev = dbdata.User[0]._collections.Sell[0];
  ev.timestamp = DateTime.fromMillis(ev.timestamp.seconds * 1000) as any;

  // decryption returns the values spec'ed in our json file.
  mockedEncrypt.mockReturnValueOnce(ev.decrypted);

  const contract = await GetContract();
  const eTransfers = await processUnsettledETransfers(contract);

  const results = eTransfers.map(getCurrentState);
  for (const result of results)
  {
    expect(result.name).toEqual("complete");
    expect(result.data.hash).toBeTruthy();
    expect(result.data.fiat?.isZero()).toBeTruthy();
    expect(result.data.coin?.isZero()).toBeTruthy();
  }
})
