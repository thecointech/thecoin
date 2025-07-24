import type { SecretKeyType } from "../types";
import { mock_key } from "./mocked_key";
export * from '../errors'

declare global {
  var __loadedSecrets: Partial<Record<SecretKeyType, string>> | undefined;
}
export async function getSecret(name: SecretKeyType) {
  // Some tests use secrets (eg - etherscan).  A test
  // may load secrets into the process.env to make
  // them available to tests.
  if (globalThis.__loadedSecrets?.[name]) {
    return globalThis.__loadedSecrets[name];
  }
  // In development we still use the private key
  switch (name) {
    case "UserDataInstructionKeyPrivate":
      return Promise.resolve(mock_key);
    // No keys in development mode
    case "VqaApiKey":
      return Promise.resolve("");
    case "VqaSslCertPublic":
      return Promise.resolve("");
    case "VqaSslCertPrivate":
      return Promise.resolve("");
    case "CeramicSeed":
      // Used by devlive for self-hosted ceramic
      return Promise.resolve("e663239643ed99d36a29bd048717c4e2b4be6c5629b997cae6de6184bf4e92a1")
    default:
      return Promise.resolve(`mock-${name}`);
  }
}

export async function init() {}
