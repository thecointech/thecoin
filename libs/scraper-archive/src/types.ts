import type { FoundElement, SearchElementData, ElementSearchParams } from "@thecointech/scraper-types";

// Needed in AgentSerializer for logging things
export type VqaCallData = {
  args: (string|number)[],
  response: any,
}

export type TestElmData = Omit<FoundElement, "element">;
export type TestSchData = {
  response?: any,
  hints?: SearchElementData,
} & Omit<ElementSearchParams, "page">;

export type SnapshotData = {
  found: TestElmData,
  match?: TestElmData,
  top: TestElmData[],
}
