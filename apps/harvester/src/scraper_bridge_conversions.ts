import { ReplayResult } from './scraper/types';

export function toBridge(value: ReplayResult) {
  if (value) {
    for (const key in value) {
      value[key] = value[key].toString()
    }
  }
  return value as Record<string, string>;
}

// function fromBridge(actionName: "visaBalance", value): Promise<Result<VisaBalanceResult>>,
// testAction(actionName: "chqBalance", inputValues?: Record<string, string>): Promise<Result<ChequeBalanceResult>>,
// testAction(actionName: "chqETransfer", inputValues?: Record<string, string>): Promise<Result<ETransferResult>>,
// export function fromBridge(type: ActionTypes, value: ReplayResult) : ReplayResult {
//   if (value) {
//     for (const key in value) {
//       // try basic conversion
//       const st = value[key] as string;
//       const asDt = DateTime.fromISO(st);
//       if (asDt.isValid) value[key] = asDt;
//       else {
//         // try currency conversion
//         const asCurrency = currency(st);
//         if (asCurrency.toString() == st) value[key] = asCurrency;
//       }
//       // Else, it's prolly a string...
//     }
//   }
//   return value;
// }