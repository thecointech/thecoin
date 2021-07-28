import React, { useEffect } from 'react';
import { AuthSwitch } from '@thecointech/shared/containers/AuthRoute';
import { useAccountStore, useAccountStoreApi } from '@thecointech/shared/containers/AccountMap';
import { AccountId } from '@thecointech/signers';

type Props = {
  routes: Record<string, React.ComponentType>,
  id: AccountId
}
export const AccountBase = ({routes, id}: Props) => {

  const store = useAccountStore();
  const accountsApi = useAccountStoreApi();

  const theCoin = store.accounts.find(account => account.name === AccountId[id]);
  useEffect(() => {
    accountsApi.setActiveAccount(theCoin?.address ?? null);
  }, []);

  return <AuthSwitch path={`/${id}`} auth={routes} />
}
