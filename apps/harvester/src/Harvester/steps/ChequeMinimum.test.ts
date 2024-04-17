import currency from 'currency.js';
import { TransferLimit } from './TransferLimit';

const limiter = (balance: number, toETransfer: number) => {
  const limiter = new TransferLimit();
  const state: any = {
    chq: {
      balance: new currency(balance),
    },
    state: {
      toETransfer: new currency(toETransfer),
    },
  }
  return limiter.process(state);
}

it ('limits transfer to protect chq balance', async () => {
  const delta = await limiter(300, 200);
  expect(delta.toETransfer).toEqual(new currency(100));
})

it ('will not generate a negative number', async () => {
  const delta = await limiter(100, 200);
  expect(delta.toETransfer).toEqual(new currency(0));
})
