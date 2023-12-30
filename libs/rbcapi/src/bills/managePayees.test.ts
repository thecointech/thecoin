
import { jest } from "@jest/globals";
import { deletePayee, addPayee } from './managePayees';
import { describe } from '@thecointech/jestutils';
import { getPayeeOptions, openBillPaymentPage } from '.';
import { ApiAction } from '../action';
import { log } from '@thecointech/logging';
import { closeBrowser } from '../scraper';

jest.setTimeout(5 * 60 * 1000);

const shouldRun = !!process.env.RBCAPI_CREDENTIALS_PATH && !process.env.JEST_CI;

// We run this test on the live website to catch any changes to RBC website.
describe("Testing Payee Management", () => {

  const fakeVisaNumber = "4520356320843708";
  const fakeVisaIssuer = "VISA - TORONTO DOMINION";
  const fakeVisaName = "testing fakevisa";

  beforeAll(async () => {
    ApiAction.initCredentials();
    // Disable logging in this file
    log.level(0);
  })
  afterAll(async () => {
    await closeBrowser();
  })

  it ('throws on non-unique name', async () => {
    const act = await openBillPaymentPage("test should-throw");
    await expect(addPayee(act, fakeVisaName, "VISA", fakeVisaNumber)).rejects.toThrow("DUPLICATE-NAME-ERROR");
  })

  it ('throws on invalid acc number name', async () => {
    const invalidVisaNumber = "4520356320843700";
    const act = await openBillPaymentPage("test should-throw");
    await expect(addPayee(act, fakeVisaName, fakeVisaIssuer, invalidVisaNumber)).rejects.toThrow("SET-ACC-NO-FAILED");
  })

  it ('ignores deleting invalid payee', async () => {
    const invalidVisaName = "im not really here";
    const r = await deletePayee(invalidVisaName);
    expect(r).toBeFalsy();
  })


  it('can add and remove a payee', async () => {

    const act = await openBillPaymentPage("test add-remove");
    const initpayees = await getPayeeOptions(act.page);
    expect(initpayees.find(payee => payee.text === fakeVisaName)).toBeFalsy();

    await addPayee(act, fakeVisaName, fakeVisaIssuer, fakeVisaNumber);

    // Get payees to verify it's there
    let payees = await getPayeeOptions(act.page);
    expect(payees.find(payee => payee.text === fakeVisaName)).toBeTruthy();

    await deletePayee(fakeVisaName);

    // refresh the page to update the results
    await act.page.reload();
    payees = await getPayeeOptions(act.page);
    expect(payees.find(payee => payee.text === fakeVisaName)).toBeFalsy();
  });

}, shouldRun)

