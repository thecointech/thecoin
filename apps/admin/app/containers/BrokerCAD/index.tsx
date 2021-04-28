import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Account, RouterPath, AccountPageProps } from '@thecointech/shared/containers/Account';
import { useAccountStore, useAccountStoreApi } from '@thecointech/shared/containers/AccountMap';
import { UploadWallet, ReadFileData } from '@thecointech/shared/containers/UploadWallet';

import { Balance } from '@thecointech/shared/containers/Balance';
import { VerifyAccount } from './VerifyAccount';
import { BillPayments } from './BillPayments';
import { Purchase } from 'containers/Purchase';
import { ETransfers } from './ETransfers';
import { Gmail } from 'containers/gmail';
import { ClientSelect } from './Clients/ClientSelect';

type Props = RouteComponentProps;

const balance = { id:"admin.brokercad.sidebar.balance",
                defaultMessage:"Balance",
                description:"Title for the balance entry in the menu"};
const purchase = {  id:"app.brokercad.sidebar.purchase",
                    defaultMessage:"Complete Purchase",
                    description:"Title for the purchase entry in the menu"};
const eTransfer = { id:"app.brokercad.sidebar.etransfer",
                  defaultMessage:"Complete e-Transfer",
                  description:"Title for the Complete e-Transfer entry in the menu"};
const billing = { id:"app.brokercad.sidebar.billing",
                  defaultMessage:"Bill Payments",
                  description:"Title for the Bill Payments entry in the menu"};
const verify = { id:"app.brokercad.sidebar.verify",
                  defaultMessage:"Verify",
                  description:"Title for the Verify entry in the menu"};
const autoPurchase = { id:"app.brokercad.sidebar.autoPurchase",
                  defaultMessage:"AutoPurchase",
                  description:"Title for the AutoPurchase entry in the menu"};
const clients = { id:"app.brokercad.sidebar.clients",
                  defaultMessage:"Clients",
                  description:"Title for the Clients entry in the menu"};


// Does this work?
const AccountMap: RouterPath[] = [
  {
    name: balance,
    urlFragment: "",
    creator: (routerProps: AccountPageProps) => ((props: any) => <Balance {...props} {...routerProps} /> ),
    exact: true
  },
  {
    name: purchase,
    urlFragment: "purchase",
    creator: (routerProps: AccountPageProps) => ((props: any) => <Purchase {...props} {...routerProps.account} />)
  },
  {
    name: eTransfer,
    urlFragment: "eTransfer",
    creator: (routerProps: AccountPageProps) => ((props: any) => <ETransfers {...props} {...routerProps.account} />)
  },
  {
    name: billing,
    urlFragment: "billing",
    creator: (routerProps: AccountPageProps) => ((props: any) => <BillPayments {...props} {...routerProps.account} />)
  },
  {
    name: verify,
    urlFragment: "verify",
    creator: (routerProps: AccountPageProps) => ((props: any) => <VerifyAccount {...props} signer={routerProps.account.signer} /> )
  },
  {
    name: autoPurchase,
    urlFragment: "autoPurchase",
    creator: (_routerProps: AccountPageProps) => ((_props: any) => <Gmail /> )
  },
  {
    name: clients,
    urlFragment: "clients",
    creator: (_routerProps: AccountPageProps) => ((_props: any) => <ClientSelect /> )
  }
]

export const AccountName = "BrokerCAD";

export const BrokerCAD = (props: Props) =>  {
  const { url } = props.match;

  const store = useAccountStore();
  const accountsApi = useAccountStoreApi();
  const brokerCAD = store.accounts.find(account => account.name === AccountName);

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


