import { getGoogleSecret } from "./google/getSecrets";
import { type SecretKeyType, type ConfigType, SecretKeyGoogle } from "../types";
import { getBitwardenSecret } from "./bitwarden/getSecrets";

// Note on projects
// There is not an easy way to differentiate between
// different projects when fetching secrets.  In order
// to keep things simple, we will limit each machine
// to a single project.  For verification we can create
// a special script with access to both projects which
// will read all the keys and verify there each project
// all have the same keys

declare global {
  var __tc_secretCache: Map<SecretKeyType, string>;
  // Secrets can be replaced by the compiler
  // This is used by the harvester to inject secrets
  // into the main process.
  var __COMPILER_REPLACE_SECRETS__: Record<string, string>|undefined;
}

export async function getSecret(name: SecretKeyType, config?: ConfigType) {
  // First, check if this secret has been added to env
  // This is used on GAE to pass select secrets in without
  // having to fetch them from the server.
  if (process.env[name]) {
    return process.env[name]!;
  }
  // next, check the cache
  if (globalThis.__tc_secretCache.has(name)) {
    return globalThis.__tc_secretCache.get(name)!;
  }
  // Is this secret from google?
  const secret = (name in SecretKeyGoogle)
    ? await getGoogleSecret(name)
    : await getBitwardenSecret(name, config);
  globalThis.__tc_secretCache.set(name, secret);
  return secret;
}

function getInitialCache() {
  if (typeof __COMPILER_REPLACE_SECRETS__ !== 'undefined') {
    const definedSecrets = Object.entries(__COMPILER_REPLACE_SECRETS__)
      .filter(([, value]) => value !== undefined) as [SecretKeyType, string][];
    return new Map<SecretKeyType, string>(definedSecrets);
  }
  return new Map<SecretKeyType, string>();
}
globalThis.__tc_secretCache = getInitialCache();
