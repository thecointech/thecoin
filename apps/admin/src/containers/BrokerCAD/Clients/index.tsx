import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import React from 'react';
import { ClientSelect } from './ClientSelect';
import { getAllUserData } from './data';

export const AllClients = () => {
  const account = AccountMap.useActive()!;
  const fetchData = () => getAllUserData(account);
  return <ClientSelect fetchData={fetchData} />
}
