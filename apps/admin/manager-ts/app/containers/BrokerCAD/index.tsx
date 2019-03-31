import * as React from 'react';
import { Account, RouterPath } from 'containers/Account';
import { Location } from 'history';

import { Balance } from 'Containers/Balance';
import { ApplicationRootState } from 'types';

interface OwnProps {
  location: Location;
}
type Props = OwnProps;

const AccountMap: RouterPath[] = [
  ["Balance",       "",         (account) => ((props) => <Balance {...props} {...account} /> ), true],
  // ["Transfer In",   "purchase", (account) => ((props) => <Purchase {...props} address={account.wallet.address} />)],
  // ["Transfer Out",  "redeem",   (account) => ((props) => <Redeem {...props} account={account}/>)],
  // ["Transfer To",   "transfer", (account) => ((props) => <Transfer {...props} />)],
  // ["Pay Bills",     "billPay",  (account) => ((props) => <Transfer {...props} />)],
  // ["Settings",     "settings",  (account) => ((props) => <Settings {...props} account={account} />)],
]

class BrokerCAD extends React.PureComponent<Props, {}, null> {

  static AccountName: keyof ApplicationRootState = "brokerCadAccount";

  render() {
    const { pathname } = this.props.location;
    return <Account accountName={BrokerCAD.AccountName} accountMap={AccountMap} url={pathname} />
  }
}

export { BrokerCAD }