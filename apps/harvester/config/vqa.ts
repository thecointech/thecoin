import { existsSync, readFileSync } from "fs";
const { getVqaSecretPath } = require("./vqa-path");

type VqaSecrets = {
  vqaCertificate: string;
  vqaApiKey: string;
}
export function getVqaSecrets() {
  // We use read file instead of import because this file
  // may not exist on CI machines.
  const path = getVqaSecretPath();
  if (!existsSync(path)) {
    return {
      vqaApiKey: "",
      vqaCertificate: "",
    }
  }
  const raw = readFileSync(path, 'utf-8');
  const content = JSON.parse(raw);
  return content as VqaSecrets;
}

