import React, { useEffect } from 'react';
import { Account, RouterPath, AccountPageProps } from '@thecointech/shared/containers/Account';
import { useAccountStore, useAccountStoreApi } from '@thecointech/shared/containers/AccountMap';
import { Balance } from '@thecointech/shared/containers/Balance';
import { Mint } from './Mint';
import { RouteComponentProps } from 'react-router';
import { Purchase } from 'containers/Purchase';
import { ReadFileData, UploadWallet } from '@thecointech/shared/containers/UploadWallet';

const balance = { id:"admin.thecoinaccounts.sidebar.balance",
                defaultMessage:"Balance",
                description:"Title for the balance entry in the menu"};
const minting = { id:"app.thecoinaccounts.sidebar.minting",
                  defaultMessage:"Minting",
                  description:"Title for the minting entry in the menu"};
const purchase = {  id:"app.thecoinaccounts.sidebar.purchase",
                    defaultMessage:"Complete Purchase",
                    description:"Title for the purchase entry in the menu"};

const AccountMap: RouterPath[] = [
  {
    name: balance,
    urlFragment: "",
    creator: (routerProps: AccountPageProps) => ((props: any) => <Balance {...props} {...routerProps} />),
    exact: true
  },
  {
    name: minting,
    urlFragment: "mint",
    creator: () => (() => <Mint />),
  },
  {
    name: purchase,
    urlFragment: "purchase",
    creator: (routerProps: AccountPageProps) => ((props: any) => <Purchase {...props} {...routerProps.account} />),
  }
];

export const AccountName = "TheCoin";

export const TheCoin = (props: RouteComponentProps) => {
  const { url } = props.match;

  const store = useAccountStore();
  const accountsApi = useAccountStoreApi();
  const theCoin = store.accounts.find(account => account.name === AccountName);

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
