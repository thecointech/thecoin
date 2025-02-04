import type { AccountResponse, PageType } from "@thecointech/vqa";
import type { ElementData } from "../../src/types";
import type { IAskUser } from "./askUser";
import type { ITestSerializer } from "./testSerializer";
import type { Recorder } from "../../src/record";
import type { EventManager } from "./eventManager";
export { ElementResponse } from "@thecointech/vqa";
export { ElementData };

export type PageIntentAug = PageType | "TwoFactorAuth";

export type AccountSummary = AccountResponse & {
  navigation: ElementData;
};

export type ProcessConfig = {
  recorder: Recorder,
  askUser: IAskUser,
  writer: ITestSerializer,
  eventManager: EventManager,
}
