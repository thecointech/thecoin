import { describe, IsManualRun } from "@thecointech/jestutils";
import { getClient } from "./client";

describe('live client test', () => {
  it('should get client', async () => {
    process.env.CONFIG_NAME = "prodtest";
    const client = await getClient("prodtest");
    expect(client).toBeDefined();
  });

  it ('should throw if CONFIG_NAME does not match secrets', async () => {
    process.env.CONFIG_NAME = "notfound";
    await expect(getClient("prodtest")).rejects.toThrow();
  });
}, IsManualRun)