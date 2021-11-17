//
// All public-facing types are defined here.
//
// TODO: convert to DateTime / Decimal for appropriate entries

import type { DateTime } from "luxon";
import type { Decimal } from "decimal.js-light"

export type Transaction = {
  txHash: string;
  // The date this tx officially happened
  date: DateTime;
  // The date the tx was processed on the blockchain
  completed?: DateTime;
  balance: number;
  from: string;
  to: string;
  value: Decimal;
  // TODO: Merge tx fee into this structures
  fee?: Decimal;

  // To Remove
  change: number;
  counterPartyAddress: string;
}
