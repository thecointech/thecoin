import React, { useCallback, useEffect, useState } from "react";
import { DropdownProps, Select } from "semantic-ui-react";
import { Client } from "./Client";
import { useFxRates } from "@thecointech/shared/containers/FxRate";
import { AllDataArray, getAllUserData } from "./data";
import { AccountMap } from '@thecointech/shared/containers/AccountMap';

export const ClientSelect = () => {

  const [users, setUsers] = useState<AllDataArray>([]);
  const [address, setAddress] = useState(undefined as string | undefined);
  const [loading, setLoading] = useState(false);
  const fxRates = useFxRates();
  const account = AccountMap.useActive();

  // Fetch all users with balance
  useEffect(() => {
    setLoading(true);
    getAllUserData(fxRates.rates, account!)
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
        options={buildOptions(users)}
      />
      {
        active
          ? <Client {...active} />
          : <div>{loading ? "Loading..." : "Select a client"}</div>
      }

    </>
  );
}

const buildOptions = (users: AllDataArray) =>
  users.map(user => ({
    key: user.address,
    value: user.address,
    icon: 'attention',
    text: `${user.name} ${user.balanceCad}`,
    data: user
  }))
