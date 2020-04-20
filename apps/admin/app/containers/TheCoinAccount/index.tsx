import React, { useEffect } from 'react';
//import { Account, RouterPath, AccountPageProps } from '@the-coin/shared/containers/Account';
//import { useAccountMap, useAccountMapApi } from '@the-coin/shared/containers/AccountMap';
import { Balance, AccountMap, Account } from '@the-coin/shared';
import { Mint } from './Mint';
import { RouteComponentProps } from 'react-router';
import { Purchase } from 'containers/Purchase';


const AccountRoutes: Account.RouterPath[] = [
  {
    name: "Balance",
    urlFragment: "",
    creator: (routerProps: Account.AccountPageProps) => ((props: any) => <Balance {...props} {...routerProps} />),
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
    creator: (routerProps: Account.AccountPageProps) => ((props: any) => <Purchase {...props} {...routerProps.account} />),
  }
];

export const AccountName = "TheCoin";

export const TheCoin = (props: RouteComponentProps) => {
  const { url } = props.match;

  const accounts = AccountMap.useAccountMap();
  const accountsApi = AccountMap.useAccountMapApi();
  const theCoin = Object.values(accounts)
    .find(account => account.name === AccountName);

  useEffect(() => {
    accountsApi.setActiveAccount(theCoin?.address);
  }, [accountsApi, theCoin])


  return <Account.Account account={theCoin} accountMap={AccountRoutes} url={url} />
}