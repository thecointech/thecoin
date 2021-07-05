//
// All public-facing types are defined here.
//
// TODO: convert to DateTime / Decimal for appropriate entries

import { DateTime } from "luxon";

export type Transaction = {
  txHash?: string;
  date: DateTime;
  completed?: DateTime;
  change: number;
  logEntry: string;
  balance: number;
  counterPartyAddress: string;
}
