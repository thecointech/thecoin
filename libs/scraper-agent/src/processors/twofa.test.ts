import { jest } from "@jest/globals"
import { describe, IsManualRun } from '@thecointech/jestutils';
import { getTestData } from "../../internal/getTestData";

jest.setTimeout(30 * 60 * 1000);

jest.unstable_mockModule("../interactions", () => ({
  clickElement: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
}));

describe('TwoFA live tests', () => {
  const tests = getTestData("TwoFA", "destination", "**/TD");
  // const gold = tests.find(t => t.key.includes("gold"));
  // const verify: any = gold?.elm("destinations");
  let skip = true;

  it.each(tests)('correctly selects the destination: %s', async (test) => {
    if (skip) {
      skip = false;
      return;
    }
    // Ok, can we find these things?
    await using agent = await test.agent(true);
    const { selectDestination } = await import("./twofa");

    await selectDestination(agent);


    // for (let i = 0; i < vqa.response.phones.phone_nos.length; i++) {
    //   const found = await updateFromPage(agent, vqa.response.phones.phone_nos[i]);
    //   const goldPhone = verify[i].name;
    //   // expect(found.data.text).toEqual(goldPhone);
    // }
  })
}, IsManualRun)

