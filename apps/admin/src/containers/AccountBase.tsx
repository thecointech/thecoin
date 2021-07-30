import React, { useEffect } from 'react';
import { AuthSwitch } from '@thecointech/shared/containers/AuthRoute';
import { AccountMap } from '@thecointech/shared/containers/AccountMap';
import { AccountId } from '@thecointech/signers';
import { Account } from '@thecointech/shared/containers/Account';

type Props = {
  routes: Record<string, React.ComponentType>,
  id: AccountId
}
export const AccountBase = ({routes, id}: Props) => {

  const accounts = AccountMap.useAsArray();
  const accountsApi = AccountMap.useApi();

  const theCoin = accounts.find(account => account.name === AccountId[id])!;
  Account(theCoin.address).useStore();
  useEffect(() => {
    accountsApi.setActiveAccount(theCoin?.address ?? null);
  }, []);

  return <AuthSwitch path={`/${id}`} auth={routes} />
}
