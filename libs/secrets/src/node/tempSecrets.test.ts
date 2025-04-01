import { describe, IsManualRun } from "@thecointech/jestutils";
import { getClient, type BWClientWithOrgId } from "./bitwarden/client";
import { getTempProjectId, getTempSecret, setTempSecret } from "./tempSecrets";

describe('live temp-secret test', () => {

  let client: BWClientWithOrgId;
  beforeAll(async () => {
    client = await getClient("prodtest");
  });

  it ('should get temp project id', async () => {
    const projectId = await getTempProjectId();
    expect(projectId).toBeDefined();
  });

  it ('can get/set a temp secret', async () => {
    const tempSecretName = "TEMP_TEST";
    const id = await setTempSecret(tempSecretName, "test");
    expect(id).toBeDefined();

    const secret = await getTempSecret(tempSecretName);
    expect(secret).toBe("test");

    // A second fetch should fail as the secret has been deleted
    await expect(getTempSecret(tempSecretName)).rejects.toThrow();
  });
}, IsManualRun)
