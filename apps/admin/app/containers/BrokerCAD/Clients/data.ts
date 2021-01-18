import { GetContract } from "@the-coin/contract";
import { RbcApi } from "@the-coin/rbcapi";
import { FXRate, weBuyAt } from "@the-coin/shared/containers/FxRate";
import { matchAll, readCache, fetchAllRecords, writeCache, Reconciliations } from "@the-coin/tx-reconciliation";
import { toHuman } from "@the-coin/utilities";
import { Contract } from "ethers";
import { BigNumber } from "ethers/utils";
import { UserState } from "./types";

export async function getAllUserData(fxRates: FXRate[]) {
  const rawData = await getRawData();
  const reconciled = await matchAll(rawData);
  return await addBalances(reconciled, fxRates);
}

async function getRawData() {
  let data = readCache();
  if (data == null) {
    const api = new RbcApi();
    data = await fetchAllRecords(api)
    writeCache(data);
  }
  return data;
}

async function addBalances(users: Reconciliations, fxRates: FXRate[]): Promise<UserState[]> {
  const contract = await GetContract();
  const balanceCoin = await addBalanceCoin(users, contract);
  return addBalanceCad(balanceCoin, fxRates);
}

const addBalanceCoin = async (users: Reconciliations, contract: Contract) => Promise.all(
  users.map(async (user) => ({
    ...user,
    balanceCoin: await getBalance(user.address, contract)
  })
  )
)

type UnPromisify<T> = T extends Promise<infer U> ? U : T;
type Coined = UnPromisify<ReturnType<typeof addBalanceCoin>>;
const addBalanceCad = (users: Coined, fxRates: FXRate[]) =>
  users.map(user => ({
    ...user,
    balanceCad: toHuman(user.balanceCoin * weBuyAt(fxRates), true)
  }))

async function getBalance(address: string, contract: Contract) {
  const balance = await contract.balanceOf(address) as BigNumber;
  return balance.toNumber()
}
