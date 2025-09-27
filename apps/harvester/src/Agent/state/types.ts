import { BankData } from "../BankCard/data";
import type { BankType as BankType_ } from "@thecointech/store-harvester";

export type BankType = Exclude<BankType_, 'both'>

export interface IActions {
  setBank(type: BankType, bank: BankData): void
  setCompleted(type: BankType, completed: boolean): void
}
