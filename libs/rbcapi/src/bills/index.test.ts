
import  { getEnvVars } from "../../../../tools/setenv";
import { describe, IsManualRun } from '@thecointech/jestutils';
import { prepareBillPayee } from '.';
import * as manage from './managePayees';
import { ApiAction, initBrowser } from '../action';

const vars = getEnvVars("prod");

jest.setTimeout(1000 * 60 * 1000);

// We run this test on the live website to catch any changes to RBC website.
describe("Live website testing", () => {

  const fakeVisaNumber = "4520356320843708";
  const fakeVisaIssuer = "VISA - TORONTO DOMINION";
  const fakeVisaName = "testing fakevisa";

  beforeAll(async () => {
    process.env.RBCAPI_CREDENTIALS_PATH = vars.RBCAPI_CREDENTIALS_PATH;
    ApiAction.initCredentials();
    await initBrowser({headless: !IsManualRun});
  })

  it ('correctly prepares to payee page', async () => {
    const p1 = await prepareBillPayee("test-preparePayee", fakeVisaName, fakeVisaIssuer, fakeVisaNumber);
    expect(p1).toBeTruthy();
    // repeats correctly
    const addPayeeSpy = jest.spyOn(manage, "addPayee");
    const p2 = await prepareBillPayee("test-preparePayee", fakeVisaName, fakeVisaIssuer, fakeVisaNumber);
    expect(p2).toBeTruthy();
    expect(addPayeeSpy).not.toHaveBeenCalled();
  })

}, !!vars.RBCAPI_CREDENTIALS_PATH)

