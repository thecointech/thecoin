import { ETransferErrorCode, IBank } from "@thecointech/bank-interface";
export { ETransferErrorCode };
export { RbcStore } from './store'
export function initBrowser() {};
export function closeBrowser() {}

let result = 1234;
export class RbcApi implements IBank {
  getBalance = () => Promise.resolve(10000);
  depositETransfer = (): ReturnType<IBank["depositETransfer"]> => {
    result += 1;
    return Promise.resolve({
      message: ETransferErrorCode.Success.toString(),
      code: ETransferErrorCode.Success,
      confirmation: result += 1,
    });
  }
  sendETransfer = (): ReturnType<IBank["sendETransfer"]> => Promise.resolve(result += 1);
  payBill = (): ReturnType<IBank["payBill"]> => Promise.resolve((result += 1).toString());
  fetchLatestTransactions = (): ReturnType<IBank["fetchLatestTransactions"]> => Promise.resolve([]);
  getTransactions = (): ReturnType<IBank["getTransactions"]> => Promise.resolve([]);

  static async create() {
    return new RbcApi();
  }
}
