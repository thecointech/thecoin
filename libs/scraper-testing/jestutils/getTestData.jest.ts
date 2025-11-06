import { getTestData as getTestDataBase, TestDataConstructor } from "../src/getTestData";
import { TestData } from "../src/testData";
import { useTestBrowser } from "./useTestBrowser";
export { hasTestingPages } from "../src/getTestData";
export { TestData } from "../src/testData";

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
