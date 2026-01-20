import type { SecretKeyType, ConfigType } from "../types";
import { SecretNotFoundError } from "../errors";

// In web environments, we need to include a few secrets (eg etherscan key etc)
declare global {
  // This is replaced by webpack
  var __COMPILER_REPLACE_SECRETS__: Record<string, string>|undefined;
}
const secrets = __COMPILER_REPLACE_SECRETS__

export async function getSecret(name: SecretKeyType, _config?: ConfigType) {
  // First, check if this secret has been added to env
  if (secrets && name in secrets) {
    return secrets[name];
  }
  throw new SecretNotFoundError(name);
}
