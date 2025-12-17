import { DateTime } from "luxon";

export async function SendFakeDeposit(_address: string, _amount: number, _date: DateTime) : Promise<boolean> {
  throw new Error("Not implemented in this environment");
}

export * from "./details";
