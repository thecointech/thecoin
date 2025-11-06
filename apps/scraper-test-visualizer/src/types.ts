import type { TestElmData, TestSchData } from "@thecointech/scraper";
import type { OverrideElement } from "@thecointech/scraper-testing/getTestData";

// Basic test data
export type Test = {
  key: string;
  element: string;
}

export type TestSnapshot = {
  time: number;
  result: TestElmData;
}

// Result of a single test
export type TestResult = {
  original: TestElmData | null;
  search: TestSchData | null;
  override: OverrideElement | null;
  snapshot: TestSnapshot[];
}


// export interface TestInfo {
//   name: string;
//   groups: TestGroup[];
//   isFailing?: boolean;
// }

// export type SelectedTest = TestInfo;
