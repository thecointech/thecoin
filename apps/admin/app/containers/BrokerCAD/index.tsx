import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Account, AccountMap, Balance, UploadWallet } from '@the-coin/shared';

import { VerifyAccount } from './VerifyAccount';
import { BillPayments } from './BillPayments';
import { Purchase } from 'containers/Purchase';
import { ETransfers } from './ETransfers';
import { Gmail } from 'containers/gmail';

type Props = RouteComponentProps;

// Does this work?
const AccountRoutes: Account.RouterPath[] = [
  {
    name: "Balance", 
    urlFragment: "",  
    creator: (routerProps: Account.AccountPageProps) => ((props: any) => <Balance {...props} {...routerProps} /> ), 
    exact: true
  },
  {
    name: "Complete Purchase",
    urlFragment: "purchase",
    creator: (routerProps: Account.AccountPageProps) => ((props: any) => <Purchase {...props} {...routerProps.account} />)
  },
  {
    name: "Complete e-Transfer",
    urlFragment: "eTransfer",
    creator: (routerProps: Account.AccountPageProps) => ((props: any) => <ETransfers {...props} {...routerProps.account} />)
  },
  {
    name: "Bill Payments",
    urlFragment: "billing",
    creator: (routerProps: Account.AccountPageProps) => ((props: any) => <BillPayments {...props} {...routerProps.account} />)
  },
  {
    name: "Verify",
    urlFragment: "verify",
    creator: (routerProps: Account.AccountPageProps) => ((props: any) => <VerifyAccount {...props} signer={routerProps.account.signer} /> )
  },
  {
    name: "AutoPurchase",
    urlFragment: "autoPurchase",
    creator: (routerProps: Account.AccountPageProps) => ((props: any) => <Gmail /> )
  }
]

export const AccountName = "BrokerCAD";

export const BrokerCAD = (props: Props) =>  {
  const { url } = props.match;

  const accounts = AccountMap.useAccountMap();
  const accountsApi = AccountMap.useAccountMapApi();
  const brokerCAD = Object.values(accounts)
    .find(account => account.name === AccountName);

  React.useEffect(() => {
    accountsApi.setActiveAccount(brokerCAD?.address);
  }, [accountsApi, brokerCAD])

  const onReadFile = React.useCallback((file: File) : Promise<UploadWallet.ReadFileData>=> { 
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
  
  return brokerCAD
    ? <Account.Account account={brokerCAD} accountMap={AccountRoutes} url={url} />
    : <UploadWallet.UploadWallet readFile={onReadFile} />
}


