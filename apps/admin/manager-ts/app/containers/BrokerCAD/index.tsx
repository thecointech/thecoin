import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { Account, RouterPath } from '@the-coin/components/lib/containers/Account';
import { Balance } from '@the-coin/components/lib';
import { VerifyAccount } from './VerifyAccount';
import { Purchase } from 'containers/Purchase';

interface OwnProps {
}
type Props = OwnProps & RouteComponentProps;

const AccountMap: RouterPath[] = [
  ["Balance",       "",         (routerProps) => ((props) => <Balance {...props} {...routerProps} /> ), true],
  ["Verify",       "verify",    (routerProps) => ((props) => <VerifyAccount {...props} wallet={routerProps.account.wallet} /> )],
  ["Complete Purchase",   "purchase", (routerProps) => ((props) => <Purchase {...props} {...routerProps.account} />)],
  // ["Transfer In",   "purchase", (account) => ((props) => <Purchase {...props} address={account.wallet.address} />)],
  // ["Transfer Out",  "redeem",   (account) => ((props) => <Redeem {...props} account={account}/>)],
  // ["Transfer To",   "transfer", (account) => ((props) => <Transfer {...props} />)],
  // ["Pay Bills",     "billPay",  (account) => ((props) => <Transfer {...props} />)],
  // ["Settings",     "settings",  (account) => ((props) => <Settings {...props} account={account} />)],
]

class BrokerCAD extends React.PureComponent<Props, {}, null> {

  static AccountName = "BrokerCAD";

  render() {
    const { url } = this.props.match;
    return <Account accountName={BrokerCAD.AccountName} accountMap={AccountMap} url={url} />
  }
}

export { BrokerCAD }