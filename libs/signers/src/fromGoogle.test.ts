import { jest } from "@jest/globals";
import { describe } from "@thecointech/jestutils";
import { getEnvVars } from "@thecointech/setenv";
import { loadFromGoogle } from "./fromGoogle";

const prodVars = getEnvVars('prodtest');
jest.setTimeout(60000);

// NOTE!  This test requires the "Secrets Manager Secret Accessor" role, which is not
// assigned to this service account
describe("Can load fromGoogle", () => {

  it ('loads a secret', async () => {

    // NOTE: If we ever run this test again, update to using secrets
    process.env.GOOGLE_APPLICATION_CREDENTIALS = prodVars.RATES_SERVICE_ACCOUNT
    process.env.GOOGLE_CLOUD_PROJECT = "rates-service-testing"

    const walletName = 'OracleUpdater';
    const secret = await loadFromGoogle(walletName);
    expect(secret.address).toEqual(prodVars.WALLET_OracleUpdater_ADDRESS);
  })
}, false)
