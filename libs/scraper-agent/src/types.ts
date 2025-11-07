import type { AccountResponse } from "@thecointech/vqa";
import type { AnyEvent, ElementData, HistoryRow } from "@thecointech/scraper-types";
import type { Recorder } from "@thecointech/scraper/record";
import type { EventManager } from "./eventManager";
import type { SectionType } from "./processors/types";
import type { DateTime } from "luxon";
export type { ElementResponse } from "@thecointech/vqa";
export type { ElementData };
import type currency from "currency.js";

// SectionName includes actions that require differentation from SectionType
// but that do not have their own processors
export type SectionName = SectionType | "Initial" | "ModalDialog" | "Manual";
export type EventSection = {
  section: SectionName;
  events: (AnyEvent|EventSection)[];
}

export type NamedOptions = {
  name: string;
  options: string[]
}
export type NamedResponse = {
  name: string;
  option:string; // Guaranteed to be a member of NamedOptions.options
}

export interface IAskUser {
  // FOR TESTING (move somewhere nice when not panicked)
  doNotCompleteETransfer(): boolean;

  forValue(question: string, options?: string[]): Promise<string>;
  selectOption(question: string, options: NamedOptions[]): Promise<NamedResponse>;

  forUsername(): Promise<string>;
  forPassword(): Promise<string>;

  expectedETransferRecipient(): Promise<string>;
}

export type AccountSummary = AccountResponse & {
  navigation: ElementData;
};

export type ProcessConfig = {
  recorder: Recorder,
  askUser: IAskUser,
  eventManager: EventManager,
}

// Result Types. This is beginning to mix concerns,
// this package should be specifically for automation
// These types should be moved to a new package scraper-banking for
// shaping the scraper around banking

export type VisaBalanceResult = {
  balance: currency;
  dueDate: DateTime;
  dueAmount: currency;
  pending?: currency;
  history?: HistoryRow[];
}

export type ChequeBalanceResult = {
  balance: currency;
}

export type ETransferResult = {
  confirmationCode: string,
}

export type ETransferInput = {
  amount: string,
}

export type ProcessAccount = Omit<AccountResponse, "position_x" | "position_y">;
export type ProcessResults = {
  events: EventSection,
  accounts: ProcessAccount[];
}
