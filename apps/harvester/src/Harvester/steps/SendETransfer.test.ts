import { jest } from '@jest/globals';
import currency from 'currency.js';
import { SendETransfer } from './SendETransfer'
import type { UserData } from '../types';
import { log } from '@thecointech/logging';

const user = {
  replay: () => Promise.resolve({ confirm: "1234" }),
} as any as UserData;

const mockLog = () => {
  const logStatements: string[] = [];
  log.warn = jest.fn<(...args: any[]) => boolean>().mockImplementation((args) => {
    logStatements.push(args);
    return false;
  });
  log.info = jest.fn<(...args: any[]) => boolean>().mockImplementation((args) => {
    logStatements.push(args);
    return false;
  });
  return logStatements;
}

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
  const msgs = mockLog();
  const sender = new SendETransfer();

  const d = await sender.process({
    chq: {
      balance: currency(100),
    },
    state: {
      toETransfer: currency(5),
    },
  } as any, user)
  expect(msgs).toContain("Skipping e-Transfer, value of 5.00 is less than minimum of 10");
  expect(d.harvesterBalance).toBeUndefined()
  expect(d.toETransfer).toBeUndefined();
})


it ('will not send more than chq balance', async () => {
  const msgs = mockLog();
  const sender = new SendETransfer();

  const d = await sender.process({
    chq: {
      balance: currency(100),
    },
    state: {
      toETransfer: currency(200),
    },
  } as any, user)
  expect(msgs).toContain("Insufficient chq balance, need 200.00, got 100.00");
  expect(d.harvesterBalance).toEqual(currency(95))
  expect(d.toETransfer).toBeUndefined();
})



it ('will not send more than e-transfers limit', async () => {
  const msgs = mockLog();
  const sender = new SendETransfer();

  const d = await sender.process({
    chq: {
      balance: currency(10000),
    },
    state: {
      toETransfer: currency(4000),
    },
  } as any, user)
  expect(msgs[1]).toEqual("Requested e-transfer is too large: 4000.00, max 3000.00");
  expect(d.harvesterBalance).toEqual(currency(3000))
  expect(d.toETransfer).toBeUndefined();
})
