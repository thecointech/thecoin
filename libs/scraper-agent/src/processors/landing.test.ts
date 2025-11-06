import { getTestData } from "../../internal/getTestData";
import { jest } from "@jest/globals";
import { navigateToLogin } from "./landing";

jest.setTimeout(60_000);

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
