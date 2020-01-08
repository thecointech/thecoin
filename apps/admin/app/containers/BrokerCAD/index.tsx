import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { Account, RouterPath, AccountProps } from '@the-coin/shared/containers/Account';
import { Balance } from '@the-coin/shared/containers/Balance';
import { VerifyAccount } from './VerifyAccount';
import { BillPayments } from './BillPayments';
import { Purchase } from 'containers/Purchase';
import { ETransfers } from './ETransfers';
import { useSelector } from 'react-redux';
import { createAccountSelector } from '../../../../../libs/shared/src/containers/Account/selector';

type Props = RouteComponentProps;

// Does this work?
const AccountMap: RouterPath[] = [
  {
    name: "Balance", 
    urlFragment: "",  
    creator: (routerProps: AccountProps) => ((props: any) => <Balance {...props} {...routerProps} /> ), 
    exact: true
  },
  {
    name: "Complete Purchase",
    urlFragment: "purchase",
    creator: (routerProps: AccountProps) => ((props: any) => <Purchase {...props} {...routerProps.account} />)
  },
  {
    name: "Complete e-Transfer",
    urlFragment: "eTransfer",
    creator: (routerProps: AccountProps) => ((props: any) => <ETransfers {...props} {...routerProps.account} />)
  },
  {
    name: "Bill Payments",
    urlFragment: "billing",
    creator: (routerProps: AccountProps) => ((props: any) => <BillPayments {...props} {...routerProps.account} />)
  },
  {
    name: "Verify",
    urlFragment: "verify",
    creator: (routerProps: AccountProps) => ((props: any) => <VerifyAccount {...props} signer={routerProps.account.signer} /> )
  }
]

export const AccountName = "BrokerCAD";

export const BrokerCAD = (props: Props) =>  {
  const { url } = props.match;
  const brokerAccount = useSelector(createAccountSelector(AccountName))
  return <Account account={brokerAccount} accountMap={AccountMap} url={url} />
}