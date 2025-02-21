import type { AccountResponse } from "@thecointech/vqa";
import type { AnyEvent, ElementData } from "@thecointech/scraper/types";
import type { Recorder } from "@thecointech/scraper/record";
import type { EventManager } from "./eventManager";
import { SectionType } from "./processors/types";
export type { ElementResponse } from "@thecointech/vqa";
export type { ElementData };

// SectionName includes actions that require differentation from SectionType
// but that do not have their own processors
export type SectionName = SectionType | "Initial" | "Username" | "ModalDialog";
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

  // forETransferRecipient(): Promise<string>;
  expectedETransferRecipient(): Promise<string>;
}

// export interface IAgentLogger {
//   // log(message: string): void;
//   logJson(intent: SectionName, name: string,data: any): void;
//   logScreenshot(intent: SectionName, screenshot: Buffer|Uint8Array, page: Page): Promise<void>;
// }


export type AccountSummary = AccountResponse & {
  navigation: ElementData;
};

export type ProcessConfig = {
  recorder: Recorder,
  askUser: IAskUser,
  // writer: ITestSerializer,
  eventManager: EventManager,
}
