import { getClient } from "./client";
import { SecretNotFoundError } from "./errors";
import type { SecretKeyType, ConfigType } from "./types";

// Note on projects
// There is not an easy way to differentiate between
// different projects when fetching secrets.  In order
// to keep things simple, we will limit each machine
// to a single project.  For verification we can create
// a special script with access to both projects which
// will read all the keys and verify there each project
// all have the same keys

declare global {
  var __tc_nameToId: Record<SecretKeyType, string> | undefined;
  var __tc_secretCache: Map<SecretKeyType, string>;
}
globalThis.__tc_secretCache = new Map<SecretKeyType, string>();

export async function getSecret(name: SecretKeyType, config?: ConfigType) {
  const client = await getClient(config);
  if (globalThis.__tc_secretCache.has(name)) {
    return globalThis.__tc_secretCache.get(name)!;
  }
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