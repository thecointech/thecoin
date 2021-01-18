import React, { useCallback, useEffect, useState } from "react";

import { Contract } from "ethers";
import { BigNumber } from "ethers/utils/bignumber";
import { DropdownProps, Select } from "semantic-ui-react";
import { Client } from "./Client";
import { toHuman } from "@the-coin/utilities";
import { fetchAllRecords, matchAll, readCache, Reconciliations, writeCache } from "@the-coin/tx-reconciliation";
import { RbcApi } from "@the-coin/rbcapi";
import { app } from 'electron';
import { GetContract } from "@the-coin/contract";
import { FXRate, useFxRates, weBuyAt } from "@the-coin/shared/containers/FxRate";
import { UserState } from "./types";

export const Clients = () => {

  const [users, setUsers] = useState([] as UserState[]);
  const [active, setActive] = useState(undefined as UserState|undefined);
  const fxRates = useFxRates();

  // Fetch all users with balance
  useEffect(() => {
    getUserData(fxRates.rates)
      .then(setUsers)
      .catch(alert)
  }, [fxRates])

  const onChange = useCallback((_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    console.log('status');
    setActive(data.something);
  }, []);

  return (
    <>
      <Select
        placeholder='Select Country'
        fluid
        search
        selection
        onChange={onChange}
        loading={users.length == 0}
        options={buildOptions(users)}
      />
      {
        active
          ? <Client {...active} />
          : <div>Select a client</div>
      }

    </>
  );
}

const buildOptions = (users: UserState[]) =>
  users.map(user => ({
    key: user.address,
    value: user.address,
    icon: 'attention',
    text: `${user.names} ${user.balanceCad}`,
    data: user
  }))

async function getUserData(fxRates: FXRate[]) {
  const rawData = await getRawData();
  const reconciled = await matchAll(rawData);
  return await addBalances(reconciled, fxRates);
}

async function getRawData() {
  const cachePath = app.getPath("userData");
  let data = readCache(cachePath);
  if (data == null) {
    const api = new RbcApi();
    data = await fetchAllRecords(api)
    writeCache(data, cachePath);
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
