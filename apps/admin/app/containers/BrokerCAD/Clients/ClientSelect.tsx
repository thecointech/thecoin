import React, { useCallback, useEffect, useState } from "react";

import { DropdownProps, Select } from "semantic-ui-react";
import { Client } from "./Client";
import { useFxRates } from "@the-coin/shared/containers/FxRate";
import { UserState } from "./types";
import { getAllUserData } from "./data";

export const ClientSelect = () => {

  const [users, setUsers] = useState([] as UserState[]);
  const [active, setActive] = useState(undefined as UserState | undefined);
  const fxRates = useFxRates();

  // Fetch all users with balance
  useEffect(() => {
    getAllUserData(fxRates.rates)
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
