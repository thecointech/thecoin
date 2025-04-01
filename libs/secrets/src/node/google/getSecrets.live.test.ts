import { jest } from "@jest/globals";
import { describe, IsManualRun } from "@thecointech/jestutils";
import { getClient } from "../bitwarden/client";
import { getGoogleSecret } from "./getSecrets";
import { initClient } from "./client";

jest.setTimeout(150000);
describe('live secrets test', () => {
  it('should get secrets', async () => {
    // Init to bitwarden
    initClient("BrokerServiceAccount", "tccc-testing");
    const client = await getClient("prodtest");
    expect(client).toBeDefined();

    const s = await getGoogleSecret("MailjetApiKey");
    expect(s).toBeDefined();
  });


}, IsManualRun)