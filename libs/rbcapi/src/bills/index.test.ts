import { jest } from "@jest/globals";
import { describe, IsManualRun } from '@thecointech/jestutils';
import { prepareBillPayee } from '.';
import * as manage from './managePayees';
import { ApiAction } from '../action';
import { closeBrowser } from '../scraper';

jest.setTimeout(5 * 60 * 1000);
// Disable until Jest supports spyOn cleanly
// https://github.com/facebook/jest/issues/9430
const shouldRun = false && !!process.env.RBCAPI_CREDENTIALS_PATH && !process.env.JEST_CI;

// We run this test on the live website to catch any changes to RBC website.
describe("Testing Pay Bills", () => {

  const fakeVisaNumber = "4520356320843708";
  const fakeVisaIssuer = "VISA - TORONTO DOMINION";
  const fakeVisaName = "testing fakevisa";

  beforeAll(ApiAction.initCredentials)
  afterAll(closeBrowser)

  it ('correctly prepares to payee page', async () => {
    const p1 = await prepareBillPayee("test-preparePayee", fakeVisaName, fakeVisaIssuer, fakeVisaNumber);
    expect(p1).toBeTruthy();
    // repeats correctly
    const addPayeeSpy = jest.spyOn(manage, "addPayee");
    const p2 = await prepareBillPayee("test-preparePayee", fakeVisaName, fakeVisaIssuer, fakeVisaNumber);
    expect(p2).toBeTruthy();
    expect(addPayeeSpy).not.toHaveBeenCalled();

    // Clean up after ourselves
    await manage.deletePayee(fakeVisaName);
  })

}, shouldRun)

