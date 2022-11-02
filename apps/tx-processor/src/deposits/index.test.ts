import { jest } from '@jest/globals';
import { init } from '@thecointech/firestore';
import { ConnectContract } from '@thecointech/contract-core';
import { ETransferErrorCode, RbcApi } from '@thecointech/rbcapi';
import gmail from '@thecointech/tx-gmail';
import { getSigner } from '@thecointech/signers';

jest.setTimeout(900000);
const errors: string[] = [];
jest.unstable_mockModule('@thecointech/logging', () => ({
  log: {
    debug: jest.fn(),
    info: jest.fn(),
    trace: jest.fn(),
    warn: jest.fn(),
    error: jest.fn((...args) => errors.push(args[1])),
  }
}));
const { processUnsettledDeposits } = await import('.')
const { log } = await import('@thecointech/logging');
const { getCurrentState } = await import('@thecointech/tx-statemachine');


it("Can complete deposits", async () => {

  init({});
  await gmail.initialize();
  // const error = jest.spyOn(log, 'error').mockImplementation();

  const brokerCad = await getSigner("BrokerCAD");
  const theContract = await ConnectContract(brokerCad);
  const bank = new RbcApi();

  // We have 5 deposits, and
  setupReturnValues(bank)
  const deposits = await processUnsettledDeposits(theContract, bank);
  expect(deposits.length).toEqual(4);
  // First, ensure that we have added our users to the DB
  for (const deposit of deposits) {
    // seed the deposit so it's visible in our emulator
    await deposit.action.doc.parent.parent!.set({ visible: true });
  }

  // We have 1 success, 3 failures
  const results = deposits.map(getCurrentState);
  expect(results.map(r => r.name)).toEqual(['complete', 'error', 'error', 'error'])
  expect(errors).toEqual([
    "Error occured on {state}, Already Deposited",
    "Error occured on {state}, This transfer was cancelled",
    "Error occured on {state}, This transfer cannot be processed",
  ])

  // If passed, balance is 0
  for (let i = 0; i < deposits.length; i++) {
    const result = results[i];
    // All emails should be appropriately marked
    expect(deposits[i].instructions?.raw?.labelIds).toContain('etransfer')
    if (result.name == "complete") {
      expect(result.data.hash).toBeTruthy();
      expect(result.data.coin?.isZero()).toBeTruthy();
      expect(result.data.fiat?.isZero()).toBeTruthy();
      expect(deposits[i].instructions?.raw?.labelIds).toContain('deposited')
    }
    else {
      expect(result.name).toEqual('error')
      expect(result.data.hash).toBeUndefined();

      // If we have no value, then the deposits were not completed
      if (result.data.fiat === undefined || result.data.coin !== undefined) {
        expect(deposits[i].instructions?.raw?.labelIds).not.toContain('deposited')
      }
    }
  }
})

function setupReturnValues(bank: RbcApi) {
  const mockDeposit = bank.depositETransfer as jest.Mock;
  mockDeposit
    .mockReturnValueOnce(
      {
        message:  "Success",
        code:  ETransferErrorCode.Success,
        confirmation: 1234,
      })
    .mockReturnValueOnce(
      {
        message:  "Already Deposited",
        code:  ETransferErrorCode.AlreadyDeposited,
      })
    .mockReturnValueOnce(
      {
        message:  "This transfer was cancelled",
        code:  ETransferErrorCode.Cancelled,
      })
    .mockReturnValueOnce(
      {
        message:  "This transfer cannot be processed",
        code:  ETransferErrorCode.InvalidInput,
      })
}
