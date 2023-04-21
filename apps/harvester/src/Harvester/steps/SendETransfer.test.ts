import currency from 'currency.js';
import { SendETransfer } from './SendETransfer'

it ('will send an e-transfer', async () => {
  const sender = new SendETransfer();

  const d = await sender.process({
    chq: {
      balance: currency(100),
    },
    state: {
      toETransfer: currency(10),
    },
  } as any)
  expect(d.harvesterBalance).toEqual(currency(10))
  expect(d.toETransfer).toBeUndefined();
})

it ('will not send more than chq balance', async () => {
  const sender = new SendETransfer();

  const d = await sender.process({
    chq: {
      balance: currency(100),
    },
    state: {
      toETransfer: currency(200),
    },
  } as any)
  expect(d.harvesterBalance).toEqual(currency(95))
  expect(d.toETransfer).toBeUndefined();
})


it ('will not send more than e-transfers limit', async () => {
  const sender = new SendETransfer();

  const d = await sender.process({
    chq: {
      balance: currency(10000),
    },
    state: {
      toETransfer: currency(4000),
    },
  } as any)
  expect(d.harvesterBalance).toEqual(currency(3000))
  expect(d.toETransfer).toBeUndefined();
})
