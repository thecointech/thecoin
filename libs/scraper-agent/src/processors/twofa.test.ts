import { jest } from "@jest/globals"
import { describe, IsManualRun } from '@thecointech/jestutils';
import { getTestPages, useTestBrowser } from "@thecointech/scraper/testutils"
import { responseToElement } from "../vqaResponse";
import { getTestData } from "../../internal/getTestData";

const {getPage} = useTestBrowser()
jest.setTimeout(3 * 60 * 1000);

describe('TwoFA live tests', () => {
  const tests = getTestData("TwoFA", "destinations", "**/TD");
  const gold = tests.find(t => t.key.includes("gold"));
  const verify: any = gold?.elm("destinations");

  it.each(tests)('correctly updates phone numbers with scraped text: %s', async (test) => {
    // Ok, can we find these things?
    await using agent = await test.agent();
    const vqa = test.vqa("destinations");
    const vqar = vqa!.response ?? vqa as any;

    for (let i = 0; i < vqar.phones.phone_nos.length; i++) {
      const p = vqar.phones.phone_nos[i];
      const response = {
        content: p.phone_number,
        position_x: p.position_x,
        position_y: p.position_y,
        neighbour_text: ""
      }
      const found = await agent.page.toElement(response, "phone");

      const goldPhone = verify[i].name;
      expect(found.data.text).toEqual(goldPhone);
    }
  })
}, IsManualRun)
