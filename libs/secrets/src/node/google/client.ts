import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { getBitwardenSecret } from "../bitwarden/getSecrets";
import { SecretGSMNotFound } from "../../errors";

export type ServiceAccountName = "RatesServiceAccount"|"BrokerServiceAccount";

declare global {
  var __tc_serviceAccountName: ServiceAccountName | undefined;
  var __tc_googleSecretClient: Promise<SecretManagerServiceClient> | undefined;
  var __tc_project: string | undefined;
}

export function initClient(service: ServiceAccountName, project?: string) {
  if (globalThis.__tc_serviceAccountName || globalThis.__tc_googleSecretClient) {
    throw new Error("Google client already initialized");
  }
  globalThis.__tc_serviceAccountName = service;
  globalThis.__tc_project = project ?? "tccc-testing";
}

export async function getClient(): Promise<SecretManagerServiceClient> {
  if (globalThis.__tc_googleSecretClient) {
    return globalThis.__tc_googleSecretClient;
  }
  globalThis.__tc_googleSecretClient = (async () => {
    return await createClient();
  })();
  return globalThis.__tc_googleSecretClient;
}

async function createClient() {
  const client = new SecretManagerServiceClient({
    credentials: await getCredentials(),
  });
  return client;
}

async function getCredentials() {
  // Running on GAE
  if (process.env.GAE_ENV)
    return undefined;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS)
    return undefined;

  if (!globalThis.__tc_serviceAccountName) {
    throw new SecretGSMNotFound();
  }

// Get credentials from secrets
  const credentials = await getBitwardenSecret(globalThis.__tc_serviceAccountName);
  return JSON.parse(credentials);
}