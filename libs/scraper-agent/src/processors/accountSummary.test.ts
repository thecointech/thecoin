import { jest } from "@jest/globals";
import { getTestData } from "../../internal/getTestData";
import { findAccountElements, saveAccountNavigation, saveBalanceElement, updateAccountNumber } from "./accountSummary"
import { describe } from '@thecointech/jestutils';
import { hasTestingPages } from "@thecointech/scraper/testutils";
import { OverviewResponse } from "@thecointech/vqa";
import type { ValueEvent } from "@thecointech/scraper";


jest.setTimeout(5 * 60 * 1000);

describe ("Correctly finds the account elements", () => {
  const testData = getTestData("AccountsSummary", "account", "latest/TD");
  it.each(testData)("For: %s", async (test) => {
    await using agent = await test.agent();
    const accounts = test.vqa("listAccounts");
    const allAccounts = await findAccountElements(agent, accounts!.response.accounts);
    expect(allAccounts.length).toEqual(accounts!.response.accounts.length);
  })
}, hasTestingPages)


describe('Updates to the correct account number', () => {
  const tests = getTestData("AccountsSummary", "account")
  it.each(tests)(`For: %s`, (test) => {
    const listed = test.vqa("listAccounts");
    for (const inferred of listed!.response.accounts) {
      const element = test.elm("account");
      const actual = updateAccountNumber(inferred, element!)
      // This is sufficient for the tests we have now, but likely will not work
      // in more complicated situations.
      expect(element).toBeTruthy();
      expect(element?.text).toContain(actual);
    }
  })
}, hasTestingPages)


describe ("Correctly finds the balance element", () => {
  const testData = getTestData("AccountsSummary", "accountBalanceElement", "2025-08-21_16-37/Tangerine");
  it.each(testData)("Finds the correct element: %s", async (test) => {
    await using agent = await test.agent();
    await saveBalanceElement(agent, "ignored", {} as any);
    const events = agent.events.allEvents;
    const elm = events.events.find(
      (e: any): e is ValueEvent => e.eventName === "balance" && e.type === "value"
    );
    const original = test.sch("balance");
    expect(elm).toBeTruthy();
    expect(elm).toEqual(expect.objectContaining({
      eventName: "balance",
      type: "value",
      text: original?.search.event.text,
      parsing: expect.objectContaining({ type: "currency" }),
    }));
  })
}, hasTestingPages)


describe("Correctly finds the navigation element", () => {
  const testData = getTestData("AccountsSummary", "navigate", "latest/TD");
  it.each(testData)("For: %s", async (test) => {
    await using agent = await test.agent();
    const { response } : { response: OverviewResponse } = test.vqa("listAccounts")!;
    const queryIter = test.vqa_iter("accountNavigateElement");
    const elms = test.elm_iter("navigate-")
    for (const [account, query, elm] of zip(response.accounts, [...queryIter], [...elms])) {
      // Get the real account number
      account!.account_number = query!.args[0] as string;
      const found = await saveAccountNavigation(agent, account!);
      expect(found.data.text).toEqual(elm!.text); // (Not sure this is working)
    }
  })
}, hasTestingPages)


// Utility function to zip multiple arrays together
function* zip<T extends readonly unknown[]>(...arrays: { [K in keyof T]: Iterable<T[K]> }): Generator<T> {
  const iterators = arrays.map(arr => arr[Symbol.iterator]());
  while (true) {
    const results = iterators.map(iter => iter.next());
    if (results.some(result => result.done)) break;
    yield results.map(result => result.value) as unknown as T;
  }
}
