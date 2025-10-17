import { BankData } from "../BankCard/data";
import type { BankType as BankType_ } from "@thecointech/store-harvester";
import type { ProcessAccount } from "@thecointech/scraper-agent/types";

export type RendererBankType = Exclude<BankType_, 'both'>
export interface IActions {
  setBank(type: RendererBankType, bank: BankData): void
  setCompleted(type: RendererBankType, completed: boolean, accounts: ProcessAccount[]): void
  setStored(): void
}
