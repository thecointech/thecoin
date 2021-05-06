import { ETransferErrorCode, DepositResult } from "@thecointech/rbcapi";

export { ETransferErrorCode };

let results = [
  ETransferErrorCode.Success,
  ETransferErrorCode.AlreadyDeposited,
  ETransferErrorCode.InvalidInput,
  ETransferErrorCode.Cancelled,
  ETransferErrorCode.UnknownError
];
let result = 0;
export class RbcApi {
    depositETransfer = () : DepositResult => {
        const code = results[result % results.length];
        result += 1;
        return {
            message: code.toString(),
            code,
            confirmation: code == ETransferErrorCode.Success ? result : undefined,
        }
    }
    sendETransfer = ()  => 123;
}
