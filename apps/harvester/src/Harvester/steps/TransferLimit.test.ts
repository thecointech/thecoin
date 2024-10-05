import currency from 'currency.js';
import { TransferLimit } from './TransferLimit';
import { mockLog } from '../../../internal/mockLog';

const limiter = (toETransfer: number|undefined, limit: number) => {
  const limiter = new TransferLimit({limit});
  const state: any = {
    state: {
      toETransfer: toETransfer ? new currency(toETransfer) : undefined,
    },
  }
  return limiter.process(state);
}

it ('limits transfer to a maximum value', async () => {
  const msgs = mockLog();
  // Nothing to limit
  const noTransfer = await limiter(undefined, 200);
  expect(noTransfer.toETransfer).toBeUndefined();
  // eTransfer less than limit
  const noLimit = await limiter(100, 200);
  expect(noLimit.toETransfer).toBeUndefined();
  // eTransfer more than limit
  const limit = await limiter(300, 200);
  expect(limit.toETransfer).toEqual(new currency(200));
  expect(msgs).toEqual(["Requested e-transfer is too large: 300.00, max 200.00"]);

  // eTransfer less than limit (caught string conversion )
  const parseError0 = await limiter(300, 2700);
  expect(parseError0.toETransfer).toBeUndefined();
  expect(msgs.length).toEqual(1);

  const parseError1 = await limiter(3000, 2700);
  expect(parseError1.toETransfer?.value).toEqual(2700);
  expect(msgs[1]).toEqual("Requested e-transfer is too large: 3000.00, max 2700.00");
})
