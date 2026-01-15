import type { OverrideElement, TestElmData, TestSchData, SnapshotData, ElementName } from "@thecointech/scraper-archive";

// Basic test data
export type Test = {
  key: string;
} & ElementName;

export type FailingTest = {
  key: string;
  element: string;
}

export type TestSnapshot = {
  time: number;
  result: SnapshotData;
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
