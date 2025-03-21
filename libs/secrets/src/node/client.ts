import { BitwardenClient, ClientSettings, DeviceType } from "@bitwarden/sdk-napi";
import path from "path";
import { existsSync, readFileSync } from "fs";
import dotenv from "dotenv";
import { SecretClientEnvNotFound, SecretClientKeyNotFound } from "../errors";
import type { ConfigType } from "../types";

type BWClientWithOrgId = BitwardenClient & {
  organizationId: string;
};

declare global {
  var __tc_secretClient: Promise<BWClientWithOrgId> | undefined;
}


export async function getClient(config?: ConfigType) {
  if (globalThis.__tc_secretClient) {
    return globalThis.__tc_secretClient;
  }
  globalThis.__tc_secretClient = (async () => {
    return await createClient(config);
  })();
  return globalThis.__tc_secretClient;
}

export async function createClient(config?: ConfigType) {
  const settings: ClientSettings = {
    apiUrl: "https://api.bitwarden.com",
    identityUrl: "https://identity.bitwarden.com",
    userAgent: "Bitwarden SDK",
    deviceType: DeviceType.SDK,
  };

  const basePath = process.env.THECOIN_ENVIRONMENTS;
  if (!basePath) {
    throw new SecretClientEnvNotFound();
  }
  // Read our .env file
  const envName = config || process.env.CONFIG_NAME || "development";
  const envFileName = `bitwarden.${envName}.env`;
  const envPath = path.join(basePath, envFileName);
  if (!existsSync(envPath)) {
    throw new SecretClientKeyNotFound(envName as ConfigType);
  }
  const raw =  readFileSync(envPath, "utf-8");
  const parsed = dotenv.parse(raw);
  const accessToken = parsed.BWS_ACCESS_TOKEN;
  const stateFile = parsed.BWS_STATE_FILE;

  const client = new BitwardenClient(settings, 2) as BWClientWithOrgId;
  client.organizationId = parsed.ORGANIZATION_ID;

  // Authenticating using a machine account access token
  await client.auth().loginAccessToken(accessToken, stateFile);
  return client;
}