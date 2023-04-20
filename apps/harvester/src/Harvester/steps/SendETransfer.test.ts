import currency from 'currency.js';
import { SendETransfer } from './SendETransfer'

it ('will send an e-transfer', async () => {
  const sender = new SendETransfer();

  const d = await sender.process({
    state: {
      toETransfer: currency(10),
    },
  } as any)
  expect(d.harvesterBalance).toEqual(currency(10))
  expect(d.toETransfer).toBeUndefined();
})
