import * as React from 'react';
import { Location } from 'history';
import { ApplicationRootState } from 'types';
import { Account, RouterPath } from 'containers/Account';
import { Balance } from 'Containers/Balance';
import { Mint } from './Mint';

interface OwnProps {
  location: Location;
}
type Props = OwnProps;

const AccountMap: RouterPath[] = [
  ["Balance",       "",         (routerProps) => ((props) => <Balance {...props} {...routerProps} /> ), true],
  ["Minting",       "/mint",    (routerProps) => ((props) => <Mint {...props} {...routerProps.account} /> ), true]
  // ["Transfer In",   "purchase", (account) => ((props) => <Purchase {...props} address={account.wallet.address} />)],
  // ["Transfer Out",  "redeem",   (account) => ((props) => <Redeem {...props} account={account}/>)],
  // ["Transfer To",   "transfer", (account) => ((props) => <Transfer {...props} />)],
  // ["Pay Bills",     "billPay",  (account) => ((props) => <Transfer {...props} />)],
  // ["Settings",     "settings",  (account) => ((props) => <Settings {...props} account={account} />)],
]
class TheCoin extends React.PureComponent<Props, {}, null> {

  static AccountName: keyof ApplicationRootState = "TheCoin";

  render() {
    const { pathname } = this.props.location;
    return <Account accountName={TheCoin.AccountName} accountMap={AccountMap} url={pathname} />
  }
}

export { TheCoin }