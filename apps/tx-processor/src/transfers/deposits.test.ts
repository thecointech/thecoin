import { jest } from '@jest/globals';
import { init } from '@thecointech/firestore';
import { ConnectContract } from '@thecointech/contract-core';
import { ETransferErrorCode } from '@thecointech/bank-interface';
import { getSigner } from '@thecointech/signers';
import { BuyActionContainer } from '@thecointech/tx-statemachine';
import { mockError } from '@thecointech/logging/mock';
import { initialize } from '@thecointech/tx-gmail';

jest.setTimeout(900000);

// Helper function to extract error messages from mock calls
const getErrorMessages = () => {
  return mockError.mock.calls.map(([args, msg]) => {
    if (typeof args === 'object' && args && typeof msg === 'string') {
      const logArgs = args as Record<string, string>;
      return msg
        .replace(/{state}/g, logArgs.state || '')
        .replace(/{error}/g, logArgs.error || '')
        .replace(/{message}/g, logArgs.message || '')
        .replace(/{transition}/g, logArgs.transition || '');
    }
    return String(args); // fallback for different call patterns
  });
};

class mockRbcApi {
  depositETransfer = jest.fn()
  static create = () => Promise.resolve(new mockRbcApi())
}
jest.unstable_mockModule('@thecointech/rbcapi', () => ({
  RbcApi: mockRbcApi
}));
const { RbcApi } = await import('@thecointech/rbcapi');
const { processTransfers } = await import('.')
const { getCurrentState } = await import('@thecointech/tx-statemachine');

it("Can complete deposits", async () => {

  init({});
  await initialize(JSON.stringify({ refresh_token: "", access_token: "", expiry_date: 0 }));

  const brokerCad = await getSigner("BrokerCAD");
  const theContract = await ConnectContract(brokerCad);
  const bank = await RbcApi.create();

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
  expect(getErrorMessages()).toEqual([
    "Error on depositReady => depositFiat: Already Deposited",
    "Detected error in action {type} from {address}",
    "Error on depositReady => depositFiat: This transfer was cancelled",
    "Detected error in action {type} from {address}",
    "Error on depositReady => depositFiat: This transfer cannot be processed",
    "Detected error in action {type} from {address}",
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

function setupReturnValues(bank: any) {
  const mockDeposit = bank.depositETransfer;
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
