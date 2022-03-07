import React, { useCallback, useEffect, useState } from "react";
import { DropdownProps, Select } from "semantic-ui-react";
import { Client } from "./Client";
import { FXRate, useFxRates } from "@thecointech/shared/containers/FxRate";
import { UserData } from "./data";
import { toCAD } from './toCAD';

type Props = {
  fetchData: () => Promise<UserData[]>;
}

export const ClientSelect = ({fetchData} : Props) => {

  const [users, setUsers] = useState<UserData[]>([]);
  const [address, setAddress] = useState(undefined as string | undefined);
  const [loading, setLoading] = useState(false);
  const fxRates = useFxRates();

  // Fetch all users with balance
  useEffect(() => {
    setLoading(true);
    fetchData()
      .then(setUsers)
      .then(() => setLoading(false))
      .catch(alert)
  }, [fxRates])

  const onChange = useCallback((_event: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
    setAddress(data.value?.toString());
  }, [setAddress]);

  const active = users.find(u => u.address === address);
  return (
    <>
      <Select
        placeholder='Select Client'
        fluid
        search
        selection
        onChange={onChange}
        loading={loading}
        options={buildOptions(users, fxRates.rates)}
      />
      {
        active
          ? <Client {...active} />
          : <div>{loading ? "Loading..." : "Select a client"}</div>
      }

    </>
  );
}

const buildOptions = (users: UserData[], rates: FXRate[]) =>
  users.map(user => ({
    key: user.address,
    value: user.address,
    icon: 'attention',
    text: `${user.name} ${toCAD(user.balanceCoin, rates)}`,
    data: user
  }))
