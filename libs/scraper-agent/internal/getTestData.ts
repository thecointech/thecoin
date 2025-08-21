import { jest } from "@jest/globals";
import { getTestData as scraperGetTestData } from "@thecointech/scraper/testutils";
import type { TestDataAgent } from "./testDataAgent";

// We always mock clickElement, tests can't update the page
jest.unstable_mockModule("../interactions", () => ({
  clickElement: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
  waitForValidIntent: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
}));

const {TestDataAgent: agentClass} = await import("./testDataAgent");
export function getTestData(section: string, searchPattern: string, recordTime = 'record-latest'): TestDataAgent[] {
  return scraperGetTestData<TestDataAgent>(section, searchPattern, recordTime, agentClass);
}
