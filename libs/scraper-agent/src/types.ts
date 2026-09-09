import type { AccountResponse } from "@thecointech/vqa";
import type { AnyEvent, ElementData, HistoryRow } from "@thecointech/scraper-types";
import type { Recorder } from "@thecointech/scraper/record";
import type { EventManager } from "./eventManager";
import type { SectionType } from "./processors/types";
import type { DateTime } from "luxon";
export type { ElementResponse } from "@thecointech/vqa";
export type { ElementData };
import type currency from "currency.js";
import type { ScraperProgressCallback } from "@thecointech/scraper";
import type { Page } from "puppeteer";

// SectionName includes actions that require differentation from SectionType
// but that do not have their own processors
export type SectionName = SectionType | "Initial" | "ModalDialog" | "Manual";
export type EventSection = {
  section: SectionName;
  events: (AnyEvent|EventSection)[];
}

export type QuestionValue = {
  question: string,
  header?: string,
}

export type QuestionConfirm = {
  confirmBtn: string,
} & QuestionValue

export type QuestionOptions = {
  options: string[]
} & QuestionValue

export type QuestionOptions2D = {
  options2d: NamedOptions[]
} & QuestionValue

export type AnyQuestion = QuestionValue | QuestionConfirm | QuestionOptions | QuestionOptions2D;

export type NamedOptions = {
  name: string;
  options: string[]
}
export type NamedResponse = {
  name: string;
  option:string; // Guaranteed to be a member of NamedOptions.options
}

// Thrown when a user calls "question.cancel()"
export class QuestionCancelError extends Error {
  constructor() {
    super("Question cancelled");
  }
}

export interface CancellablePromise<T> extends Promise<T> {
  // Cancels the question, and throws the awaited CancellablePromise with a QuestionCancelError
  cancel: () => void;
}

export function nonCancellable<T>(promise: Promise<T>): CancellablePromise<T> {
  const cp = promise as CancellablePromise<T>;
  cp.cancel = () => {};
  return cp;
}

export interface IAskUser {
  // FOR TESTING (move somewhere nice when not panicked)
  doNotCompleteETransfer(): boolean;

  forValue(basic: QuestionValue): CancellablePromise<string>;
  forConfirm(basic: QuestionConfirm): CancellablePromise<boolean>;
  selectOption(basic: QuestionOptions): CancellablePromise<string>;
  selectOption2D(basic: QuestionOptions2D): CancellablePromise<NamedResponse>;

  forUsername(): Promise<string>;
  forPassword(): Promise<string>;

  expectedETransferRecipient(): Promise<string>;
}

export type AgentErrorParams = {
  // The page being processed
  page: Page,
  // The caught exception
  err: unknown,
  // The section we are currently processing
  section: SectionName,
}
// Attempt to handle an error.  If the error was handled gracefully,
// return true to continue processing.
export type AgentErrorCallback = (params: AgentErrorParams) => Promise<boolean>;
export interface IAgentCallbacks {
  onProgress?: ScraperProgressCallback;
  onError?: AgentErrorCallback;
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

export interface SectionResultMap extends Partial<Record<SectionName, unknown>> {
  AccountsSummary?: ChequeBalanceResult;
  CreditAccountDetails?: VisaBalanceResult;
  SendETransfer?: ETransferResult;
}

export type ETransferInput = {
  amount: string,
}

export type ProcessAccount = Omit<AccountResponse, "position_x" | "position_y">;
export type ProcessResults = {
  events: EventSection,
  accounts: ProcessAccount[];
}
