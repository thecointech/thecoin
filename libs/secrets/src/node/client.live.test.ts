import { describe, IsManualRun } from "@thecointech/jestutils"; 
import { getClient } from "./client";

describe('live client test', () => {
  it('should get client', async () => {
    const client = await getClient("prodtest");
    expect(client).toBeDefined();
  });
}, IsManualRun)