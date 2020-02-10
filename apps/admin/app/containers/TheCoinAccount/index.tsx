import React, { useEffect } from 'react';
import { Account, RouterPath, AccountPageProps } from '@the-coin/shared/containers/Account';
import { useAccountMap, useAccountMapApi } from '@the-coin/shared/containers/AccountMap';
import { Balance } from '@the-coin/shared/containers/Balance';
import { Mint } from './Mint';
import { RouteComponentProps } from 'react-router';
import { Purchase } from 'containers/Purchase';


const AccountMap: RouterPath[] = [
  {
    name: "Balance",
    urlFragment: "",
    creator: (routerProps: AccountPageProps) => ((props: any) => <Balance {...props} {...routerProps} />),
    exact: true
  },
  {
    name: "Minting",
    urlFragment: "mint",
    creator: () => ((props: any) => <Mint />),
  },
  {
    name: "Complete Purchase",
    urlFragment: "purchase",
    creator: (routerProps: AccountPageProps) => ((props: any) => <Purchase {...props} {...routerProps} />),
  }
];

export const AccountName = "TheCoin";

export const TheCoin = (props: RouteComponentProps) => {
  const { url } = props.match;

  const accounts = useAccountMap();
  const accountsApi = useAccountMapApi();
  const theCoin = Object.values(accounts)
    .find(account => account.name === AccountName);

  useEffect(() => {
    accountsApi.setActiveAccount(theCoin?.address);
  }, [accountsApi, theCoin])


  return <Account account={theCoin} accountMap={AccountMap} url={url} />
}