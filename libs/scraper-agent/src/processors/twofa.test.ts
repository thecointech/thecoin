import { jest } from "@jest/globals"
import { describe, IsManualRun } from '@thecointech/jestutils';
import { getTestPages, useTestBrowser } from "@thecointech/scraper/testutils"
import { responseToElement } from "../vqaResponse";

const {getPage} = useTestBrowser()
jest.setTimeout(3 * 60 * 1000);

describe('TwoFA live tests', () => {
  it ('correctly updates phone numbers with scraped text', async () => {

    const tests = await getTestPages("record", "TwoFA", "TD");
    for (const test of tests) {
      const vqa = {
        "num_phone_numbers": 2,
        "phone_numbers": [
          {
            "phone_number": "+1 (111) 123-4567",
            "position_x": 397,
            "position_y": 319
          },
          {
            "phone_number": "+1 (111) 987-6543",
            "position_x": 394,
            "position_y": 400
          }
        ]
      }

      // Ok, can we find these things?
      const page = await getPage();
      await page.goto(test.url);

      for (const p of vqa.phone_numbers) {
        const response = {
          content: p.phone_number,
          position_x: p.position_x,
          position_y: p.position_y,
          neighbour_text: ""
        }
        const element = await responseToElement({ page, response });
        console.log(`${element.data.text} - ${JSON.stringify(element.data.coords)}`);
      }
    }
  })
}, IsManualRun)
