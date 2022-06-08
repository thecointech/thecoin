
import  { getEnvVars } from "@thecointech/setenv";
import { describe, IsManualRun } from '@thecointech/jestutils';
import { prepareBillPayee } from '.';
import * as manage from './managePayees';
import { ApiAction, closeBrowser, initBrowser } from '../action';

const vars = getEnvVars("prod");
jest.setTimeout(5 * 60 * 1000);
const shouldRun = !!vars.RBCAPI_CREDENTIALS_PATH && !process.env.JEST_CI;

// We run this test on the live website to catch any changes to RBC website.
describe("Testing Pay Bills", () => {

  const fakeVisaNumber = "4520356320843708";
  const fakeVisaIssuer = "VISA - TORONTO DOMINION";
  const fakeVisaName = "testing fakevisa";

  beforeAll(async () => {
    process.env.RBCAPI_CREDENTIALS_PATH = vars.RBCAPI_CREDENTIALS_PATH;
    ApiAction.initCredentials();
    await initBrowser({headless: !IsManualRun});
  })
  afterAll(async () => {
    await closeBrowser();
  })

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

