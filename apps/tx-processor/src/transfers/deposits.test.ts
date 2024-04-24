import { jest } from '@jest/globals';
import { init } from '@thecointech/firestore';
import { ConnectContract } from '@thecointech/contract-core';
import { ETransferErrorCode, RbcApi } from '@thecointech/rbcapi';
import gmail from '@thecointech/tx-gmail';
import { getSigner } from '@thecointech/signers';
import { BuyActionContainer } from '@thecointech/tx-statemachine';

jest.setTimeout(900000);
const errors: string[] = [];
jest.unstable_mockModule('@thecointech/logging', () => ({
  log: {
    debug: jest.fn(),
    info: jest.fn(),
    trace: jest.fn(),
    warn: jest.fn(),
    error: jest.fn((args: Record<string, string>, msg: string) => {
      errors.push(
        msg
          .replace(/{state}/g, args.state)
          .replace(/{error}/g, args.error)
          .replace(/{transition}/g, args.transition)
        )
    }),
  }
}));
const { processTransfers } = await import('.')
const { getCurrentState } = await import('@thecointech/tx-statemachine');

it("Can complete deposits", async () => {

  init({});
  await gmail.initialize();

  const brokerCad = await getSigner("BrokerCAD");
  const theContract = await ConnectContract(brokerCad);
  const bank = new RbcApi();

  // We have 5 deposits, and
  setupReturnValues(bank)
  const deposits = (await processTransfers(theContract, bank)) as BuyActionContainer[];
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
    "Error on depositReady => depositFiat for {initialId}: Already Deposited",
    "Error on depositReady => depositFiat for {initialId}: This transfer was cancelled",
    "Error on depositReady => depositFiat for {initialId}: This transfer cannot be processed",
  ])

  // If passed, balance is 0
  for (let i = 0; i < deposits.length; i++) {
    const result = results[i];
    // All emails should be appropriately marked
    expect(deposits[i].instructions?.raw?.labelIds).toContain('etransfer')

    const hashes = deposits[i].history.filter(d => d.delta.hash)
    if (result.name == "complete") {
      // A hash should be set and the cleared in the subsequent wait
      expect(hashes.length).toBe(1);
      expect(result.data.coin?.isZero()).toBeTruthy();
      expect(result.data.fiat?.isZero()).toBeTruthy();
      expect(deposits[i].instructions?.raw?.labelIds).toContain('deposited')
    }
    else {
      expect(result.name).toEqual('error')
      expect(hashes.length).toBe(0);

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
