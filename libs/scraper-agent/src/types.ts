import type { AccountResponse, ElementResponse } from "@thecointech/vqa";
import type { AnyEvent, ElementData } from "@thecointech/scraper/types";
import type { Page } from 'puppeteer'
import type { Recorder } from "@thecointech/scraper/record";
import type { EventManager } from "./eventManager";
import { SectionType } from "./processors/types";
export type { ElementResponse } from "@thecointech/vqa";
export type { ElementData };

export type SectionName = SectionType | "Initial";
export type EventSection = {
  section: SectionName;
  events: (AnyEvent|EventSection)[];
}

export type User2DChoice<T> = Record<string, T[]>;
export type ElementOptions = User2DChoice<ElementResponse>;
export type ChoiceText<T> = keyof {
  [K in keyof T as T[K] extends string ? K : never]: T[K]
}


export interface IAskUser {
  forValue(question: string): Promise<string>;
  selectOption<T extends object>(question: string, options: User2DChoice<T>, z: ChoiceText<T>): Promise<T>;

  forUsername(): Promise<string>;
  forPassword(): Promise<string>;
  forETransferRecipient(): Promise<string>;
}

export interface IAgentLogger {
  // log(message: string): void;
  logJson(intent: SectionName, name: string,data: any): void;
  logScreenshot(intent: SectionName, screenshot: Buffer|Uint8Array, page: Page): Promise<void>;
}


export type AccountSummary = AccountResponse & {
  navigation: ElementData;
};

export type ProcessConfig = {
  recorder: Recorder,
  askUser: IAskUser,
  // writer: ITestSerializer,
  eventManager: EventManager,
}
