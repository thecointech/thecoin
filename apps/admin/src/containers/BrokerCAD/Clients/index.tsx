import { AccountMap } from '@thecointech/redux-accounts';
import { ClientSelect } from './ClientSelect';
import { getAllUserData } from './data';

export const AllClients = () => {
  const account = AccountMap.useActive()!;
  const fetchData = () => getAllUserData(account);
  return <ClientSelect fetchData={fetchData} />
}
