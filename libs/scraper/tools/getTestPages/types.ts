import type { AccountResponse } from "@thecointech/vqa";
import { ElementData } from "../../src/types";


export type AccountSummary = AccountResponse & {
  navigation: ElementData;
};
