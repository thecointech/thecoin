import type { ReplayResult } from '@thecointech/scraper-types';

export function toBridge(value: ReplayResult) {
  const flat: Record<string, string> = {};
  if (value) {
    for (const section in value) {
      for (const key in value[section]) {
        flat[key] = value[section][key].toString();
      }
    }
  }
  return flat;
}

// function fromBridge(actionName: "visaBalance", value): Promise<Result<VisaBalanceResult>>,
// testAction(actionName: "chqBalance", inputValues?: Record<string, string>): Promise<Result<ChequeBalanceResult>>,
// testAction(actionName: "chqETransfer", inputValues?: Record<string, string>): Promise<Result<ETransferResult>>,
// export function fromBridge(type: ActionType, value: ReplayResult) : ReplayResult {
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
