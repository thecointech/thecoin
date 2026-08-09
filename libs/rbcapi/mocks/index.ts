import { BankMock, ETransferErrorCode } from '@thecointech/bank-interface/mocked';
export { ETransferErrorCode };

export function initBrowser() {}
export function closeBrowser() {}

// Don't extend BaseStore, rbcapi is mocked in prodtest but doesn't want a store there.
export class RbcStore {
  static initialize() { }
  static async release() { }
}

export { BankMock };
export const RbcApi = BankMock;
