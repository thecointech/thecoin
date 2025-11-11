import { TestData, type TestDataConstructor, getTestData as getTestDataBase } from "@thecointech/scraper-archive";
import { newPage } from "@thecointech/scraper";
import { gotoPage } from "@thecointech/scraper/gotoPage";

// Version can be used in general node apps
export function getTestData<T extends TestData>(
  section: string,
  searchPattern: string,
  recordTime = 'latest',
  constructor: TestDataConstructor<T> = TestData as any,
): T[] {

  const getPage = async (url: string) => {
    const { page } = await newPage("default");
    await gotoPage(page, url);
    return page;
  }
  return getTestDataBase(section, searchPattern, recordTime, constructor, getPage);
}
