import { BankData } from "../BankCard/data";
import type { BankType as BankType_ } from "@thecointech/store-harvester";
import type { AccountResponse } from '@thecointech/vqa';

export type BankType = Exclude<BankType_, 'both'>

export type AccountResult = Omit<AccountResponse, 'position_x' | 'position_y'>
export interface IActions {
  setBank(type: BankType, bank: BankData): void
  setCompleted(type: BankType, completed: boolean, results?: AccountResult[]): void
}
