
import { jest } from "@jest/globals"
import { describe } from '@thecointech/jestutils';
import { getTestData } from "../internal/getTestData";
import { hasTestingPages } from "@thecointech/scraper/testutils";
import type { Page } from "puppeteer";
import type { FoundElement } from "@thecointech/scraper/types";

jest.setTimeout(3 * 60 * 1000);

const mocks = {
  clickElement: jest.fn<(page: Page, found: FoundElement, noNavigate?: boolean, minPixelsChanged?: number) => Promise<boolean>>().mockResolvedValue(true),
  waitForValidIntent: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
}
jest.unstable_mockModule("./interactions", () => mocks);

const { maybeCloseModal } = await import("./modal");

const tests = getTestData("modals", "*", "features");
it ('Should have some tests', () => {
  expect(tests.length).toBeGreaterThan(0)
})

beforeEach(() => {
  mocks.clickElement.mockClear();
})

describe('modal vqa tests finds the correct close element', () => {
  it.each(tests)("For: %s", async (test) => {
    await using agent = await test.agent();
    const r = await maybeCloseModal(agent.page.page);
    expect(r).toBeTruthy();
    expect(mocks.clickElement).toHaveBeenCalled();
    const found = mocks.clickElement.mock.calls[0][1];
    const elm = test.elm("closeModal");
    expect(found.data.selector).toEqual(elm?.selector);
  })
}, hasTestingPages)

