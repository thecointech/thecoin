import { jest } from "@jest/globals";
import { getTestData, hasTestingPages } from "../../internal/getTestData";
import { listAccounts, saveAccountNavigation, saveBalanceElement, validateAccountNumberAgainstSource } from "./accountSummary"
import { describe } from '@thecointech/jestutils';
import { OverviewResponse } from "@thecointech/vqa";
import type { ValueEvent } from "@thecointech/scraper";
import { EventBus } from "@thecointech/scraper/events/eventbus";
import { TestElmData } from "@thecointech/scraper-archive";
import { mockTrace, mockWarn } from "@thecointech/logging/mock";


jest.setTimeout(5 * 60 * 1000);

describe ("Correctly lists accounts", () => {
  const testData = getTestData("AccountsSummary", "account");
  it.each(testData)("For: %s", async (test) => {
    await using agent = await test.agent();
    const allAccounts = await listAccounts(agent);
    const original_navs = test.elm_iter("navigate");
    for (const [account, nav] of zip(allAccounts, original_navs)) {
      expect(nav.data.text).toEqual(account.nav.data.text);
      expect(nav.data.selector).toEqual(account.nav.data.selector);
    }
  })
}, hasTestingPages)


describe('Updates to the correct account number', () => {
  const tests = getTestData("AccountsSummary", "listAccounts", "archive")
  beforeEach(() => {
    jest.resetAllMocks();
  })
  it.each(tests)(`For: %s`, (test) => {
    const listed = test.vqa("listAccounts")!;
    const original_accounts = test.elm_iter("account");
    const response: OverviewResponse = listed.response;
    for (const [inferred, element] of zip(response.accounts, original_accounts)) {
      const actual = validateAccountNumberAgainstSource(inferred.account_number, element!.data);
      // This is sufficient for the tests we have now, but likely will not work
      // in more complicated situations.
      expect(actual).toBeTruthy();
      expect(mockTrace).toHaveBeenCalled();
      expect(mockWarn).not.toHaveBeenCalled();
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
      text: original?.event.text,
      parsing: expect.objectContaining({ type: "currency" }),
    }));
  })
}, hasTestingPages)


// Utility function to zip multiple arrays together
function* zip<T extends readonly unknown[]>(...arrays: { [K in keyof T]: Iterable<T[K]> }): Generator<T> {
  const iterators = arrays.map(arr => arr[Symbol.iterator]());
  while (true) {
    const results = iterators.map(iter => iter.next());
    const allDone = results.every(r => r.done);
    const someDone = results.some(r => r.done);
    if (someDone && !allDone) {
      throw new Error("All iterators must have the same length");
    }
    if (allDone) break;
    yield results.map(result => result.value) as unknown as T;
  }
}
