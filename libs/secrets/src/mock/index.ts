import type { SecretKeyType } from "../types";
import { mock_key } from "./mocked_key";
export * from '../errors'

export async function getSecret(name: SecretKeyType) {
  // In development we still use the private key
  switch (name) {
    case "UserDataInstructionKeyPrivate":
      return Promise.resolve(mock_key);
    // No keys in development mode
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
