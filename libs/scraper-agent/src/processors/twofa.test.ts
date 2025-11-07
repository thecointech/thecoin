import { jest } from "@jest/globals"
import { describe } from '@thecointech/jestutils';
import { getTestData } from "../../internal/getTestData";
import { getDestinationOptions } from "./twofa";
import { hasTestingPages } from "@thecointech/scraper-archive/getTestData";

jest.setTimeout(30 * 60 * 1000);

describe('TwoFA destination tests', () => {
  const tests = getTestData("TwoFA", "destination", "**/TD");

  it.each(tests)('correctly finds the destinations: %s', async (test) => {
    await using agent = await test.agent();
    const destinations = await getDestinationOptions(agent);
    const gold = test.gold("phone_nos");
    for (const d of destinations) {
      const goldp = gold[d.name];
      expect(goldp).toBeTruthy();
      expect(goldp).toHaveLength(d.options.length);
      for (const o of d.options) {
        expect(goldp).toContainEqual(o.content);
      }
    }
  })
  // it.each(tests)('correctly selects the destination: %s', async (test) => {
  //   // if (skip) {
  //   //   skip = false;
  //   //   return;
  //   // }
  //   // Ok, can we find these things?
  //   await using agent = await test.agent();

  //   const selected = test.elm("destination");
  //   expect(selected).toBeTruthy();
  //   test.mockInput((type, question, options) => {
  //     expect(type).toBe("option");
  //     return { group: 0, option: 0 };
  //   });

  //   await selectDestination(agent);


  //   // for (let i = 0; i < vqa.response.phones.phone_nos.length; i++) {
  //   //   const found = await updateFromPage(agent, vqa.response.phones.phone_nos[i]);
  //   //   const goldPhone = verify[i].name;
  //   //   // expect(found.data.text).toEqual(goldPhone);
  //   // }
  // })
}, hasTestingPages)

