import { newPage } from "@thecointech/scraper";
import { TestData, type TestDataConstructor, getTestData as getTestDataBase } from "@thecointech/scraper-archive";

// Version can be used in general node apps
export function getTestData<T extends TestData>(
  section: string,
  searchPattern: string,
  recordTime = 'latest',
  constructor: TestDataConstructor<T> = TestData as any,
): T[] {

  const getPage = async () => {
    const { page } = await newPage("default");
    return page;
  }
  return getTestDataBase(section, searchPattern, recordTime, constructor, getPage);
}
