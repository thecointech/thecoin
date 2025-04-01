import { getClient } from "./client";
import { SecretNotFoundError } from "../../errors";
import { type SecretKeyType, type ConfigType } from "../../types";

declare global {
  var __tc_nameToId: Record<SecretKeyType, string> | undefined;
}
export async function getBitwardenSecret(name: SecretKeyType, config?: ConfigType) {
    // finally, fetch from the server
    const client = await getClient(config);
    const id = await nameToId(name);
    if (!id) {
      throw new SecretNotFoundError(name);
    }
    const secret = await client.secrets().get(id);
    globalThis.__tc_secretCache.set(name, secret.value);
    return secret.value;
}

export async function nameToId(name: SecretKeyType) {
  if (globalThis.__tc_nameToId) {
    return globalThis.__tc_nameToId[name];
  }
  const mapping = await getMapping();
  globalThis.__tc_nameToId = mapping;
  return mapping[name];
}

export async function getMapping() {
  const client = await getClient();
  const secrets = await client.secrets().list(client.organizationId);
  return secrets.data
    .reduce((acc, secret) => {
    acc[secret.key as SecretKeyType] = secret.id;
    return acc;
  }, {} as Record<SecretKeyType, string>);
}