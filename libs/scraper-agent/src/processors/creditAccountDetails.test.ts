import { getTestData } from "../../internal/getTestData";
import { describe } from '@thecointech/jestutils';
import { jest } from "@jest/globals";
import { getValueParsing, parseValue } from "@thecointech/scraper/valueParsing";

jest.setTimeout(5 * 60 * 1000);

describe ("Correctly finds the dueDate element", () => {
  const testData = getTestData("CreditAccountDetails", "dueDate", "archive/2025-07-25_15-16/**/TD");
  it.each(testData)("Finds the correct element: %s", async (test) => {
    await using agent = await test.agent();
    const vqa = test.vqa("dueDate");
    const elm = await agent.page.toElement(vqa!.response!, {
      eventName: "testing",
      parsing: {
        type: "date",
        format: null,
      }
    });

    // Normalize dates
    const elmParsing = getValueParsing(elm.data.text, "date");
    const vqaParsing = getValueParsing(vqa!.response!.content, "date");
    expect(elmParsing.format).toBeTruthy();
    expect(vqaParsing.format).toBeTruthy();
    const elmDate = parseValue(elm.data.text, elmParsing);
    const vqaDate = parseValue(vqa!.response!.content, vqaParsing);
    expect(elmDate).toEqual(vqaDate);
  })
}, !!process.env.PRIVATE_TESTING_PAGES)
