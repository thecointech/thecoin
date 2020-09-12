import { ETransferErrorCode, DepositResult } from "@the-coin/rbcapi";

export { ETransferErrorCode };
export class RbcApi {
    constructor() {
        console.log("Created");
    }

    results = [
        ETransferErrorCode.Success,
        ETransferErrorCode.AlreadyDeposited,
        ETransferErrorCode.InvalidInput,
        ETransferErrorCode.Cancelled,
        ETransferErrorCode.UnknownError
    ];
    result = 0;
    depositETransfer = () : DepositResult => {
        const code = this.results[this.result % this.results.length];
        this.result += 1;
        return {
            message: code.toString(),
            code,
            confirmation: code == ETransferErrorCode.Success ? this.result : undefined;
        }
    }
}
