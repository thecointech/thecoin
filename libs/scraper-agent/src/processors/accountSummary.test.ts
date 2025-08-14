import { jest } from "@jest/globals";
import { getTestData } from "../../internal/getTestData";
import { init } from "../../tools/init";
import { updateAccountNumber } from "./accountSummary"
import { IsManualRun, describe } from '@thecointech/jestutils';
import { patchOnnxForJest } from "@thecointech/scraper/testutils";

jest.setTimeout(5 * 60 * 1000);

beforeAll(async () => {
  patchOnnxForJest();
  await init();
})

describe ("Correctly finds the balance element", () => {
  const testData = getTestData("AccountsSummary", "balance", "record-archive/2025-07-25_15-16/**/TD");
  it.each(testData)("Finds the correct element: %s", async (test) => {
    await using agent = await test.agent();
    const vqa = test.vqa("balance");
    const response = vqa!.response ?? vqa as any;
    const elm = await agent.page.toElement(response, { eventName: "testing"});
    expect(elm.data.text).toEqual(response.content);
  })
}, !!process.env.PRIVATE_TESTING_PAGES)

describe('cached tests', () => {
  const tests = getTestData("AccountsSummary", "account")
  it.each(tests)(`Updates to the correct account number for: %s`, (test) => {
    const listed = test.vqa("listAccounts");

    for (const inferred of listed!.response.accounts) {
      const element = test.elm("account");

      const actual = updateAccountNumber(inferred, element!)

      // This is sufficient for the tests we have now, but likely will not work
      // in more complicated situations.
      const siblings = element?.siblingText?.map(s => s.replaceAll(/[a-zA-Z]/g, "").trim())
      expect(siblings).toContain(actual);
    }
  })
}, !!process.env.PRIVATE_TESTING_PAGES)
