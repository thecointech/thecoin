import { Timestamp } from "@thecointech/firestore";
import { CertifiedTransferRequest } from "@thecointech/types";

export type UserAction = "Buy"|"Sell"|"Bill";

export type EncryptedPacket = {
  encryptedPacket: string;
  version: string;
}

export type CertifiedTransfer = {
  transfer: CertifiedTransferRequest;
  instructionPacket: EncryptedPacket;
  signature: string;
}

// An action stores very little data directly.
// Instead, it has an 'events' subcollection
// which is a record of all the state changes
// that have happened to the collection.
export type BaseActionType = { timestamp: Timestamp; }
export type BuyAction = {
  data: {
    amount: number;
    type: "etransfer"|"deposit"|"other";
    sourceId: string;
  }
} & BaseActionType;
export type SellAction = { data: CertifiedTransfer } & BaseActionType;
export type BillAction = { data: CertifiedTransfer } & BaseActionType;

export type EventTypes =
  "tocoin" |
  "tofiat" |
  "pretransfer" |
  "confirm-fiat" |
  "confirm-tc" |
  "refund" |
  "completed";

// export type BaseEventType = {
//   timestamp: Timestamp;
//   type: EventTypes;
// }
export interface BaseEventType<TypeName extends EventTypes|unknown = unknown, Data=unknown> {
  timestamp: Timestamp;
  type: TypeName;
  data: Data;
}

export type ToCoinEvent = BaseEventType<"tocoin", number>;
// export type PreTransferEvent = { data: "fiat"|"coin" } & BaseEventType;
// export type FiatTransferEvent = { data: string }|{ error: string} & BaseEventType;
// export type CoinTransferEvent = { data: string }|{ error: string} & BaseEventType;
export type CompletedEvent = BaseEventType<"completed", string>;

// export type ProcessRecord = {
//   recievedTimestamp: Timestamp,
//   processedTimestamp?: Timestamp,
//   completedTimestamp?: Timestamp,
//   hash: string,
//   hashRefund?: string,
//   confirmed: boolean,
//   fiatDisbursed: number
//   confirmation?: number;
// }

// export type CertifiedTransferRecord = CertifiedTransfer & ProcessRecord;
