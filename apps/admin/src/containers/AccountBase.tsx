import { useEffect } from 'react';
import { AccountMap } from '@thecointech/redux-accounts';
import { AccountId } from '@thecointech/signers';
import { Account } from '@thecointech/shared/containers/Account';
import { Outlet } from 'react-router';

type Props = {
  id: AccountId
}
export const AccountBase = ({id}: Props) => {

  const accounts = AccountMap.useAsArray();
  const accountsApi = AccountMap.useApi();

  const theCoin = accounts.find(account => account.name === AccountId[id])!;
  Account(theCoin.address).useStore();
  useEffect(() => {
    accountsApi.setActiveAccount(theCoin?.address ?? null);
  }, []);

  return <Outlet />
}
