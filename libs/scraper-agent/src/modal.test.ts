
import { jest } from "@jest/globals"
import { describe } from '@thecointech/jestutils';
import { getTestData, hasTestingPages } from "../internal/getTestData";
import type { Page } from "puppeteer";
import type { FoundElement } from "@thecointech/scraper-types";

jest.setTimeout(3 * 60 * 1000);

const mocks = {
  clickElement: jest.fn<(page: Page, found: FoundElement, noNavigate?: boolean, minPixelsChanged?: number) => Promise<boolean>>().mockResolvedValue(true),
  waitForValidIntent: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
}
jest.unstable_mockModule("./interactions", () => mocks);

const { maybeCloseModal } = await import("./modal");

describe('modal vqa tests finds the correct close element', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  })

  const tests = getTestData("modals", "*", "features");
  it.each(tests)("For: %s", async (test) => {
    await using agent = await test.agent();
    const r = await maybeCloseModal(agent.page.page);
    expect(r).toBeTruthy();
    expect(mocks.clickElement).toHaveBeenCalled();
    const found = mocks.clickElement.mock.calls[0][1];
    const elm = test.elm("closeModal");
    expect(found.data.selector).toEqual(elm?.data.selector);
  })
}, hasTestingPages)

