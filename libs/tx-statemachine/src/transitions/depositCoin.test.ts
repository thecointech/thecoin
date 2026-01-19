import { jest } from "@jest/globals";
import { Wallet, ContractTransactionResponse } from 'ethers';
import { BillActionContainer } from '../types';
import { BuildVerifiedAction } from '@thecointech/utilities/VerifiedAction'
import { DateTime } from 'luxon';
import { ContractCore } from '@thecointech/contract-core';
import { createAction } from '@thecointech/broker-db';
import { depositCoin } from './depositCoin';
import { init } from '@thecointech/firestore';

jest.useFakeTimers();

beforeEach(async () => {
  jest.setSystemTime(now.toJSDate());
  jest.resetAllMocks();

  await init();
});

describe('depositCoin', () => {

  it('should succeed when balance is exactly equal to value + fee', async () => {
    const value = 100;
    const fee = 10;
    const balance = value + fee;

    const container = await getContainer(value, balance, fee);
    const result = await depositCoin(container);

    expect(result).not.toHaveProperty('error');
    expect(container.contract.certifiedTransfer).toHaveBeenCalled();
  });

  it('should return insufficient funds error when balance is less than value + fee', async () => {
    const value = 100;
    const fee = 10;
    const balance = value + fee - 1;

    const container = await getContainer(value, balance, fee);
    const result = await depositCoin(container);

    expect(result).toEqual({ error: 'Insufficient funds' });
    expect(container.contract.certifiedTransfer).not.toHaveBeenCalled();
  });
});

// Data
const now = DateTime.now().minus({ days: DateTime.now().weekday }).set({ hour: 12, minute: 0, second: 0 });
const signer = Wallet.createRandom();
const instructions = {
  payee: "TestAccount",
  accountNumber: "123",
};

const getContainer = async (value: number, balance: number, fee: number): Promise<BillActionContainer> => {
  const sale = await BuildVerifiedAction(
    instructions,
    signer,
    "0x0000000000000000000000000000000000000000",
    value,
    fee,
  );

  const action = await createAction(signer.address, "Bill", {
    initial: sale,
    date: now,
    initialId: sale.signature
  });

  const contract = await ContractCore.get();
  jest.spyOn(contract, 'balanceOf').mockResolvedValue(BigInt(balance));
  jest.spyOn(contract, 'certifiedTransfer');

  return {
    action,
    bank: {} as any,
    contract,
    history: [{
      name: "preTransfer",
      delta: {
        type: "preTransfer",
        created: now,
      },
      data: {},
    }],
    instructions,
  };
}
