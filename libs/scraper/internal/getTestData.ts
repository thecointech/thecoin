import { getTestData as getTestDataBase, TestDataConstructor, TestData } from "@thecointech/scraper-archive";
import { useTestBrowser } from "./useTestBrowser";

// Version specific to jest tests
export function getTestData<T extends TestData>(
  section: string,
  searchPattern: string,
  recordTime = 'latest',
  constructor: TestDataConstructor<T> = TestData as any,
): T[] {
  const { getPage } = useTestBrowser();
  return getTestDataBase(section, searchPattern, recordTime, constructor, getPage);
}
