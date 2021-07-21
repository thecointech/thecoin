import { UserReconciled } from "@thecointech/tx-reconciliation";

export type UserState = UserReconciled & {
  balanceCoin: number;
  balanceCad: number;
};
