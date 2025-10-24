import { getTestData as scraperGetTestData } from "@thecointech/scraper/testutils";
import { TestDataAgent } from "./testDataAgent";

export function getTestData(section: string, searchPattern: string, recordTime = 'latest'): TestDataAgent[] {
  return scraperGetTestData<TestDataAgent>(section, searchPattern, recordTime, TestDataAgent);
}
