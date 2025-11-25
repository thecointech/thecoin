import { getTestData } from "../../internal/getTestData";
import { jest } from "@jest/globals";
import { describe } from "@thecointech/jestutils";
import { navigateToLogin } from "./landing";
import { hasTestingPages } from "../../internal/getTestData";

jest.setTimeout(60_000);

describe("Correctly finds the login element", () => {

  const testData = getTestData("Landing", "login", "unit-tests");

  it.each(testData)('correctly finds the login element', async (test) => {
    await using agent = await test.agent();

    const r = await navigateToLogin(agent);
    const vqa = test.vqa("login");
    const elm = await agent.page.toElement(vqa!.response!, {
      eventName: "testing",
      tagName: "button"
    });
    expect(elm).toBeDefined();
  })
}, hasTestingPages)
