import { SecretKeyType } from "./getSecrets";
export { SecretNotFoundError } from "./getSecrets";

export function getSecret(name: SecretKeyType) {
  return Promise.resolve(`mock-${name}`);
}