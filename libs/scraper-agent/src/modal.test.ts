
import { jest } from "@jest/globals"
import { useTestBrowser, getTestPages } from '@thecointech/scraper/testutils'
import { closeModal, maybeCloseModal } from './modal';

jest.setTimeout(3 * 60 * 1000);

const tests = await getTestPages("Intents", "Modals")

describe('modal vqa tests', () => {

  const { getPage } = useTestBrowser();


  it ('Should have some tests', () => {
    expect(tests.length).toBeGreaterThan(0)
  })

  // NOTE: Some of these tests fail due to inconsistent rendering
  // between the original page and after loading from mhtml
  // Still useful for debugging & validation
  describe('testing with live VQA', () => {
    for (const test of tests) {
      it (`${test.name} closes automagically`, async () => {
        const page = await getPage();
        await page.goto(test.url);
        const r = await maybeCloseModal(page);
        expect(r).toBeTruthy();
      })
    }
  })

  describe('testing with cached VQA', () => {
    for (const test of tests) {
      const vqa = test.json.find(j => j.name == "vqa");
      if (!vqa) {
        continue;
      }
      it (`${test.name} closes with cached vqa`, async () => {
        const page = await getPage();
        await page.goto(test.url);
        const r = await closeModal(page, vqa.data);
        expect(r).toBeTruthy();
      })
    }
  })

  // it ('will close modals automagically', async () => {

  //   const page = await getPage();
  //   await page.goto(getTestPage("Intents", "Modals", "test-2.mhtml"));

  //   const r = await maybeCloseModal(page);
  //   expect(r).toBeTruthy();
  // })

  // it ('closes another modal', async () => {
  //   // const page = await getPage();
  //   // await page.goto(getTestPage("modal-tests", "test-1.mhtml"));
  //   // const vqa = getTestInfo("modal-tests", "test-1-vqa.json");

  //   // const r1 = await maybeCloseModal(page);
  //   // const r = await closeModal(page, vqa);
  //   // expect(r).toBeTruthy();
  // })

})
