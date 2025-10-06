import { log } from "@thecointech/logging";
import { banks } from "../BankCard/data";
import { BankData } from "../BankCard/data";
import { BankIdent } from "@thecointech/store-harvester";
import { AccountResult, BankType } from "./types";


export type BankReducerType = {
  completed?: boolean;
  results?: AccountResult[]; // JSON data from scraper
} & BankData;
export type InitialState = {
  [K in BankType]: BankReducerType | undefined;
}

export async function getInitialState(): Promise<InitialState> {
  const stored = await window.scraper.getBankConnectDetails();
  if (stored.error) {
    log.error({error: stored.error}, "Error loading bank details: {error}")
    alert("Error loading bank details: " + stored.error)
  }

  const [chequing, credit] = stored.value?.both
    ? [stored.value.both, stored.value.both]
    : [stored.value?.chequing, stored.value?.credit];
  return {
    chequing: toBankData(chequing),
    credit: toBankData(credit),
  };
}

function toBankData(init: BankIdent | undefined) {
  const r = banks.find(b => b.name === init?.name);
  if (r) {
    return {
      completed: true,
      ...r
    }
  }
  return undefined;
}
