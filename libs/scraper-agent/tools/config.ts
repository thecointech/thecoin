import { readFileSync } from "fs";
import path from "path";

export type BankConfig = {
  url: string,
  username?: string,
  password?: string,
  to_recipient?: string,
  questions?: Record<string, string>,
  refresh?: boolean,
  bad_credentials?: {
    username?: string,
    password?: string
  }
}
export type TestConfig = Record<string, BankConfig>;

export function getConfig() {
  const baseFolder = process.env.PRIVATE_TESTING_PAGES;
  if (!baseFolder) {
    throw new Error("PRIVATE_TESTING_PAGES is not set");
  }
  return {
    baseFolder,
    config: JSON.parse(
      readFileSync(
        path.join(baseFolder, "config.json"),
        "utf-8"
      )
    ) as TestConfig,
  };
}
