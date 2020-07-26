import React, { useEffect } from 'react';
import { Account, RouterPath, AccountPageProps } from '@the-coin/shared/containers/Account';
import { useAccountMap, useAccountMapApi } from '@the-coin/shared/containers/AccountMap';
import { Balance } from '@the-coin/shared/containers/Balance';
import { Mint } from './Mint';
import { RouteComponentProps } from 'react-router';
import { Purchase } from 'containers/Purchase';
import { ReadFileData, UploadWallet } from '@the-coin/shared/containers/UploadWallet';


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
    creator: () => (() => <Mint />),
  },
  {
    name: "Complete Purchase",
    urlFragment: "purchase",
    creator: (routerProps: AccountPageProps) => ((props: any) => <Purchase {...props} {...routerProps.account} />),
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
    accountsApi.setActiveAccount(theCoin?.address ?? null);
  }, [accountsApi, theCoin])

  const onReadFile = React.useCallback((file: File) : Promise<ReadFileData>=> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const target: any = e.target;
        const data = target.result;
        resolve({
          wallet: data,
          name: AccountName }
        );
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }, []);

  return theCoin
    ? <Account account={theCoin} accountMap={AccountMap} url={url} />
    : <UploadWallet readFile={onReadFile} />
}
