export interface TestGroup {
  timestamp: number;
  files: {
    blank?: string;
    found?: string;
    original?: string;
  };
}

// export type SectionTests = {
//   section: string;
//   elements: string[];
// }
// export type TargetTests = {
//   target: string;
//   sections: SectionTests[];
// }
// export interface AllTests {
//   date: string;
//   targets: TargetTests[];
// }

// Basic test data
export type Test = {
  folder: string; // Relative to 'archive' folder
  step: number;
  element: string;

  // date: string;
  // target: string;
  // section: string;
}

// export interface TestInfo {
//   name: string;
//   groups: TestGroup[];
//   isFailing?: boolean;
// }

// export type SelectedTest = TestInfo;
