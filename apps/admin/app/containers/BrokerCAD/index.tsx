import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Account, RouterPath, AccountPageProps } from '@the-coin/shared/containers/Account';
import { useAccountMap, useAccountMapApi } from '@the-coin/shared/containers/AccountMap';
import { UploadWallet, ReadFileData } from '@the-coin/shared/containers/UploadWallet';

import { Balance } from '@the-coin/shared/containers/Balance';
import { VerifyAccount } from './VerifyAccount';
import { BillPayments } from './BillPayments';
import { Purchase } from 'containers/Purchase';
import { ETransfers } from './ETransfers';
import { Gmail } from 'containers/gmail';
import { Clients } from './Clients';

type Props = RouteComponentProps;

// Does this work?
const AccountMap: RouterPath[] = [
  {
    name: "Balance",
    urlFragment: "",
    creator: (routerProps: AccountPageProps) => ((props: any) => <Balance {...props} {...routerProps} /> ),
    exact: true
  },
  {
    name: "Complete Purchase",
    urlFragment: "purchase",
    creator: (routerProps: AccountPageProps) => ((props: any) => <Purchase {...props} {...routerProps.account} />)
  },
  {
    name: "Complete e-Transfer",
    urlFragment: "eTransfer",
    creator: (routerProps: AccountPageProps) => ((props: any) => <ETransfers {...props} {...routerProps.account} />)
  },
  {
    name: "Bill Payments",
    urlFragment: "billing",
    creator: (routerProps: AccountPageProps) => ((props: any) => <BillPayments {...props} {...routerProps.account} />)
  },
  {
    name: "Verify",
    urlFragment: "verify",
    creator: (routerProps: AccountPageProps) => ((props: any) => <VerifyAccount {...props} signer={routerProps.account.signer} /> )
  },
  {
    name: "AutoPurchase",
    urlFragment: "autoPurchase",
    creator: (_routerProps: AccountPageProps) => ((_props: any) => <Gmail /> )
  },
  {
    name: "Clients",
    urlFragment: "clients",
    creator: (_routerProps: AccountPageProps) => ((_props: any) => <Clients /> )
  }
]

export const AccountName = "BrokerCAD";

export const BrokerCAD = (props: Props) =>  {
  const { url } = props.match;

  const accounts = useAccountMap();
  const accountsApi = useAccountMapApi();
  const brokerCAD = Object.values(accounts)
    .find(account => account.name === AccountName);

  React.useEffect(() => {
    if (brokerCAD?.address)
      accountsApi.setActiveAccount(brokerCAD?.address);
  }, [accountsApi, brokerCAD])

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

  return brokerCAD
    ? <Account account={brokerCAD} accountMap={AccountMap} url={url} />
    : <UploadWallet readFile={onReadFile} />
}


