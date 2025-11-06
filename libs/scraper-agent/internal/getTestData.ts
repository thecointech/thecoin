import { getTestData as scraperGetTestData } from "@thecointech/scraper-testing/getTestData";
import { TestDataAgent } from "./testDataAgent";

export function getTestData(section: string, searchPattern: string, recordTime = 'latest'): TestDataAgent[] {
  return scraperGetTestData<TestDataAgent>(section, searchPattern, recordTime, TestDataAgent);
}
