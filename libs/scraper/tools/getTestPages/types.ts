import type { AccountResponse, PageType } from "@thecointech/vqa";
import { ElementData } from "../../src/types";
import { Page } from "puppeteer";
import { IAskUser } from "./askUser";
import { ITestSerializer } from "./testSerializer";
import { Recorder } from "../../src/record";
export { ElementResponse } from "@thecointech/vqa";
export { ElementData };

export type PageIntentAug = PageType | "TwoFactorAuth";

export type AccountSummary = AccountResponse & {
  navigation: ElementData;
};

export type ProcessConfig = {
  recorder: Recorder
  askUser: IAskUser,
  writer: ITestSerializer
}
