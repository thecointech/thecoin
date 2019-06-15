import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { Account, RouterPath, AccountProps } from '@the-coin/components/containers/Account';
import { Balance } from '@the-coin/components/containers/Balance';
import { VerifyAccount } from './VerifyAccount';
import { Purchase } from 'containers/Purchase';

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
    name: "Verify",
    urlFragment: "verify",
    creator: (routerProps: AccountProps) => ((props: any) => <VerifyAccount {...props} wallet={routerProps.account.wallet} /> )
  },
  {
    name: "Complete Purchase",
    urlFragment: "purchase",
    creator: (routerProps: AccountProps) => ((props: any) => <Purchase {...props} {...routerProps.account} />)
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