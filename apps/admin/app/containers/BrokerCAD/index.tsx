import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { Account, RouterPath, AccountProps } from '@the-coin/components/containers/Account';
import { Balance } from '@the-coin/components/containers/Balance';
import { VerifyAccount } from './VerifyAccount';
import { BillPayments } from './BillPayments';
import { Purchase } from 'containers/Purchase';
import { ETransfers } from './ETransfers';

interface OwnProps {
}
type Props = OwnProps & RouteComponentProps;

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

class BrokerCAD extends React.PureComponent<Props, {}, null> {

  static AccountName = "BrokerCAD";

  render() {
    const { url } = this.props.match;
    return <Account accountName={BrokerCAD.AccountName} accountMap={AccountMap} url={url} />
  }
}

export { BrokerCAD }