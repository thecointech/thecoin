import currency from 'currency.js';
import { TransferLimit } from './TransferLimit';

it ('limits transfer to protect chq balance', async () => {

  const limiter = new TransferLimit();
  const state: any = {
    chq: {
      balance: new currency(300),
    },
    state: {
      toETransfer: new currency(200),
    },
  }
  const delta = await limiter.process(state);
  expect(delta.toETransfer).toEqual(new currency(100));
})
