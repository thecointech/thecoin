import type { SecretKeyType, ConfigType } from "../types";
import { SecretNotFoundError } from "../errors";

// In web environments, we need to include a few secrets (eg etherscan key etc)
const secrets: Record<string, string> = JSON.parse(
    process.env.__COMPILER_REPLACE_SECRETS__!
)

export async function getSecret(name: SecretKeyType, _config?: ConfigType) {
  // First, check if this secret has been added to env
  if (secrets[name]) {
    return secrets[name];
  }
  throw new SecretNotFoundError(name);
}