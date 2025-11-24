import { tests } from "@thecointech/scraper-archive";
import { readFileSync } from "fs";

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
  return {
    baseFolder: tests(),
    config: JSON.parse(
      readFileSync(
        tests("config.json"),
        "utf-8"
      )
    ) as TestConfig,
  };
}
