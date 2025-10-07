import { log } from "@thecointech/logging";
import { banks } from "../BankCard/data";
import type { BankData } from "../BankCard/data";
import type { BankType } from "./types";
import type { ProcessAccount } from "@thecointech/scraper-agent/types";
import type { BankConnectDetails } from "@/Harvester/events";


export type BankReducerType = {
  completed?: boolean;
  accounts?: ProcessAccount[]; // JSON data from scraper
} & BankData;
export type InitialState = {
  banks: { [K in BankType]: BankReducerType | undefined };
  stored?: boolean;
}

export async function getInitialState(): Promise<InitialState> {
  const stored = await window.scraper.getBankConnectDetails();
  if (stored.error) {
    log.error({error: stored.error}, "Error loading bank details: {error}")
    alert("Error loading bank details: " + stored.error)
  }

  const hasCreditDetails = await window.scraper.hasCreditDetails();
  if (hasCreditDetails.error) {
    log.error({error: hasCreditDetails.error}, "Error loading credit details: {error}")
    alert("Error loading credit details: " + hasCreditDetails.error)
  }

  const [chequing, credit] = stored.value?.both
    ? [stored.value.both, stored.value.both]
    : [stored.value?.chequing, stored.value?.credit];
  return {
    banks: {
      chequing: toBankData(chequing),
      credit: toBankData(credit),
    },
    stored: hasCreditDetails.value,
  };
}

function toBankData(init: BankConnectDetails | undefined): BankReducerType | undefined {
  const r = banks.find(b => b.name === init?.name);
  if (r) {
    return {
      completed: true,
      accounts: init?.accounts,
      ...r
    }
  }
  return undefined;
}
