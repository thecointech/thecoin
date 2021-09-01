import { ETransferErrorCode } from "./types";
import type { RbcApi as SrcApi } from "./index";
import { jest } from '@thecointech/jestutils/shim';

export { ETransferErrorCode };
export { RbcStore } from './store'
export function initBrowser() {};
export function closeBrowser() {}

let result = 1234;
export class RbcApi implements Pick<SrcApi, keyof SrcApi> {
  depositETransfer = jest.fn(() => {
    result += 1;
    // Always succeeds (but can be mocked for failure if necessary)
    return Promise.resolve({
      message:  ETransferErrorCode.Success.toString(),
      code:  ETransferErrorCode.Success,
      confirmation: result += 1,
    });
  });
  sendETransfer = jest.fn(() => Promise.resolve(result += 1));
  fetchLatestTransactions = jest.fn(() => Promise.resolve([]));
  getTransactions = jest.fn(() => Promise.resolve([]));
  initialize = jest.fn(() => { });
}
