import { jest } from "@jest/globals";
import { getTestData } from "../../internal/getTestData";
import { saveBalanceElement, updateAccountNumber } from "./accountSummary"
import { IsManualRun, describe } from '@thecointech/jestutils';

jest.setTimeout(5 * 60 * 1000);


describe ("Correctly finds the balance element", () => {
  const testData = getTestData("AccountsSummary", "accountBalanceElement", "2025-08-21_16-37/Tangerine");
  it.each(testData)("Finds the correct element: %s", async (test) => {
    await using agent = await test.agent();
    await saveBalanceElement(agent, "123456789", {} as any);
    const events = agent.events.allEvents;
    const elm: any = events.events.find((e: any) => e.eventName == "balance");
    const original = test.sch("balance");
    expect(elm).toBeDefined();
    expect(elm.data.text).toEqual(original?.search.event.text);
  })
}, !!process.env.PRIVATE_TESTING_PAGES)

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
    expect(elm.data.text).toEqual(vqa!.response!.content);
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

