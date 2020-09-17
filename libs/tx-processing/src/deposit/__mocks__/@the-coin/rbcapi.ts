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
        const code = this.results[(this.result += 1) % this.results.length];
        return { 
            message: ETransferErrorCode[code],
            code,
        }
    }
}