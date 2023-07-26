import currency from 'currency.js';
import { SendETransfer } from './SendETransfer'
import type { UserData } from '../types';

const user = {
  replay: () => Promise.resolve({ confirm: "1234" }),
} as any as UserData;

it ('will send an e-transfer', async () => {
  const sender = new SendETransfer();

  const d = await sender.process({
    chq: {
      balance: currency(100),
    },
    state: {
      toETransfer: currency(10),
    },
  } as any, user)
  expect(d.harvesterBalance).toEqual(currency(10))
  expect(d.toETransfer).toBeUndefined();
})

it ('Does not send an insignificant amount', async () => {
  const sender = new SendETransfer();

  const d = await sender.process({
    chq: {
      balance: currency(100),
    },
    state: {
      toETransfer: currency(5),
    },
  } as any, user)
  expect(d.harvesterBalance).toBeUndefined()
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
  } as any, user)
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
  } as any, user)
  expect(d.harvesterBalance).toEqual(currency(3000))
  expect(d.toETransfer).toBeUndefined();
})
