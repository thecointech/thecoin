import { jest } from "@jest/globals";
import { init as FirestoreInit } from '@thecointech/firestore';
import { Wallet } from 'ethers';
import { BillActionContainer } from '../types';
import { BuildUberAction } from '@thecointech/utilities/UberAction'
import { BuildVerifiedAction } from '@thecointech/utilities/VerifiedAction'
import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import { GetContract } from '@thecointech/contract-core';
import { createAction } from '@thecointech/broker-db';
import { CertifiedTransfer, UberTransferAction } from '@thecointech/types';

jest.useFakeTimers();
const getSingle = jest.fn<(currency: number, timestamp: number) => Promise<any>>();
jest.unstable_mockModule('@thecointech/pricing', () => ({
  RatesApi: class {
    getSingle = getSingle
  }
}))

beforeEach(async () => {
  await FirestoreInit();
  jest.setSystemTime(now.toJSDate());
  jest.resetAllMocks();
  getSingle.mockResolvedValue({
    status: 200,
    data: {
      fxRate: 1,
      sell: 1,
      buy: 1,
    }
  })
})

it ("correctly converts UberTransfer", async () => {

  const xferAt = now.plus({weeks: 3});
  const sale = await BuildUberAction(
    instructions,
    signer,
    "0x0000000000000000000000000000000000000000",
    amount,
    124,
    xferAt
  );

  const container = await getContainer(sale);

  // processed next day
  jest.setSystemTime(now.plus({day: 1}).toJSDate());

  const {toFiat} = await import('./toCoin');

  const preRun = await toFiat(container);
  expect(preRun).toBeNull();

  // Advance 3 weeks
  jest.setSystemTime(now.plus({days: 22}).toJSDate());
  const postRun = await toFiat(container);
  expect(postRun?.coin?.eq(0)).toBeTruthy();
  expect(postRun?.fiat?.gt(0)).toBeTruthy();

  expect(getSingle).toBeCalledTimes(1);
  expect(getSingle).toBeCalledWith(124, xferAt.toMillis());
})



it ("correctly converts CertifiedTransfer", async () => {
  const sale = await BuildVerifiedAction(
    instructions,
    signer,
    "0x0000000000000000000000000000000000000000",
    amount.toNumber(),
    0,
  );

  const container = await getContainer(sale);
  const {toFiat} = await import('./toCoin');

  const preRun = await toFiat(container);
  expect(preRun).toBeNull();

  // processed next day
  jest.setSystemTime(now.plus({day: 1}).toJSDate());
  const postRun = await toFiat(container);
  expect(postRun?.coin?.eq(0)).toBeTruthy();
  expect(postRun?.fiat?.gt(0)).toBeTruthy();

  expect(getSingle).toBeCalledTimes(1);
  expect(getSingle).toBeCalledWith(124, now.toMillis());
})

// Data

// Now is last wednesday
const amount = new Decimal(100e6);
const now = DateTime.now().minus({ days: (7 + 3 - DateTime.now().weekday) % 7 }).set({ hour: 12 });
const signer = Wallet.createRandom();
const instructions = {
  payee: "TestAccount",
  accountNumber: "123",
};

const getContainer = async (sale: CertifiedTransfer | UberTransferAction) : Promise<BillActionContainer> => {

  const action = await createAction(signer.address, "Bill", {
    initial: sale,
    date: now,
    initialId: sale.signature
  });

  return {
    action,
    bank: {} as any,
    contract: await GetContract(),
    history: [
      {
        name: "mocked",
        data: {
          coin: amount,
        },
        delta: {
          created: now,
          type: "mocked",
        }
      }
    ],
    instructions,
  };
}
