import { UserReconciled } from "@the-coin/tx-reconciliation";

export type UserState = UserReconciled & {
  balanceCoin: number;
  balanceCad: number;
};
