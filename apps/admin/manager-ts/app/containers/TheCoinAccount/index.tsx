import * as React from 'react';
import { ApplicationRootState } from 'types';
import { Account, RouterPath } from 'containers/Account';
import { Balance } from 'Containers/Balance';
import { Mint } from './Mint';
import { RouteComponentProps } from 'react-router';

interface OwnProps {
}
type Props = OwnProps & RouteComponentProps;

const AccountMap: RouterPath[] = [
  ["Balance",       "",         (routerProps) => ((props) => <Balance {...props} {...routerProps} /> ), true],
  ["Minting",       "mint",    (routerProps) => ((props) => <Mint {...props} {...routerProps.account} /> )],
  // ["Transfer In",   "purchase", (account) => ((props) => <Purchase {...props} address={account.wallet.address} />)],
  // ["Transfer Out",  "redeem",   (account) => ((props) => <Redeem {...props} account={account}/>)],
  // ["Transfer To",   "transfer", (account) => ((props) => <Transfer {...props} />)],
  // ["Pay Bills",     "billPay",  (account) => ((props) => <Transfer {...props} />)],
  // ["Settings",     "settings",  (account) => ((props) => <Settings {...props} account={account} />)],
]
class TheCoin extends React.PureComponent<Props, {}, null> {

  static AccountName: keyof ApplicationRootState = "TheCoin";

  render() {
    const { url } = this.props.match;
    return <Account accountName={TheCoin.AccountName} accountMap={AccountMap} url={url} />
  }
}

export { TheCoin }