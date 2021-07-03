import { ETransferErrorCode, RbcApi as SrcApi } from "@thecointech/rbcapi";

export { ETransferErrorCode };

let results = [
  ETransferErrorCode.Success,
  ETransferErrorCode.AlreadyDeposited,
  ETransferErrorCode.InvalidInput,
  ETransferErrorCode.Cancelled,
  ETransferErrorCode.UnknownError
];
let result = 0;
export class RbcApi implements Pick<SrcApi, keyof SrcApi> {
  depositETransfer() {
    const code = results[result % results.length];
    result += 1;
    return Promise.resolve({
      message: code.toString(),
      code,
      confirmation: code == ETransferErrorCode.Success ? result : undefined,
    });
  }
  sendETransfer = () => Promise.resolve(123);
  fetchLatestTransactions = () => Promise.resolve([]);
  getTransactions = () => Promise.resolve([]);
  initialize = () => { };
}

// Mock store does nothing
export class RbcStore {
  static initialize() {};
}

// No browser
export function initBrowser() {};
