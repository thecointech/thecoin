import * as React from 'react';
import { ApplicationRootState } from 'types';
import { Account, RouterPath } from 'containers/Account';
import { Balance } from 'Containers/Balance';
import { Mint } from './Mint';
import { RouteComponentProps } from 'react-router';
import { Purchase } from 'containers/Purchase';

interface OwnProps {
}
type Props = OwnProps & RouteComponentProps;

const AccountMap: RouterPath[] = [
  ["Balance",       "",         (routerProps) => ((props) => <Balance {...props} {...routerProps} /> ), true],
  ["Minting",       "mint",    (routerProps) => ((props) => <Mint {...props} updateBalance={routerProps.dispatch.updateBalance} {...routerProps.account} /> )],
  ["Complete Purchase",   "purchase", (routerProps) => ((props) => <Purchase {...props} {...routerProps.account} />)],
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