import { readFileSync } from "fs";
import path from "path";

export type BankConfig = {
  url: string,
  username?: string,
  password?: string,
  refresh?: boolean,
}
export type TestConfig = Record<string, BankConfig>;

export function getConfig() {
  if (!process.env.PRIVATE_TESTING_PAGES) {
    throw new Error("PRIVATE_TESTING_PAGES is not set");
  }
  const baseFolder = path.join(process.env.PRIVATE_TESTING_PAGES, "unit-tests");
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
