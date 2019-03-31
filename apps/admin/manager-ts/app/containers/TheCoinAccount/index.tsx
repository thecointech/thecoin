import * as Sidebar from 'containers/PageSidebar/actions';
import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { TheContract } from '@the-coin/utilities';
import { Location } from 'history';

import { Login } from 'Containers/Login';
import { Balance } from 'Containers/Balance';
import { ContainerState as AccountState } from 'Containers/Account/types';
import { NotFoundPage } from 'containers/NotFoundPage'
import { buildReducer } from 'containers/Account/reducer'
import { createAccountSelector } from 'containers/Account/selector';
import * as Account from 'containers/Account/actions';
import { UploadWallet } from 'containers/UploadWallet';
import { Mint } from './Mint';

interface OwnProps {
  location: Location;
}
type Props = OwnProps & AccountState & Sidebar.DispatchProps & Account.DispatchProps;

type RouterPath = [string, string, (props: AccountState) => (props: any) => React.ReactNode, boolean?]
const AccountMap: RouterPath[] = [
  ["Balance",       "",         (account) => ((props) => <Balance {...props} {...account} /> ), true],
  ["Minting",       "/mint",    (account) => ((props) => <Mint {...props} {...account} /> ), true]
  // ["Transfer In",   "purchase", (account) => ((props) => <Purchase {...props} address={account.wallet.address} />)],
  // ["Transfer Out",  "redeem",   (account) => ((props) => <Redeem {...props} account={account}/>)],
  // ["Transfer To",   "transfer", (account) => ((props) => <Transfer {...props} />)],
  // ["Pay Bills",     "billPay",  (account) => ((props) => <Transfer {...props} />)],
  // ["Settings",     "settings",  (account) => ((props) => <Settings {...props} account={account} />)],
]

class AccountClass extends React.PureComponent<Props, {}, null> {

  static AccountName = "TheCoin";

  constructor(props) {
    super(props);
    this.onFileUpload = this.onFileUpload.bind(this);
  }

  buildLink(item: RouterPath) {
    const url = this.props.location.pathname;
    return url.endsWith('/') ?
      `${url}${item[1]}` :
      `${url}/${item[1]}`

  }
  
  async readOwner() {
    const roles = await TheContract.GetContract().getRoles();
    return roles[2];
  }

  async onFileUpload(jsonObject) {
    const address = await this.readOwner();
    if (jsonObject.address == address)
      this.props.setWallet(jsonObject);
    else {
      alert("Bad Wallet");
    }
  }

  componentDidMount() {
    const { wallet } = this.props;

    if (wallet && wallet.privateKey) {
      const accountLinks = AccountMap.map((item) => {
        return {
          link: {
            name: item[0],
            to: this.buildLink(item)
          }
        }
      })
      this.props.setSubItems(AccountClass.AccountName, accountLinks)
    }
    else {
      this.props.setName(AccountClass.AccountName);
      this.props.setSubItems("", []);
    }
  }

  render() {
    const { location, ...account } = this.props;
    const { wallet, name } = account;
    if (wallet === null) {
      return <UploadWallet onSelect={this.onFileUpload} />;
    }
    else if (!wallet.privateKey) {
      return <Login wallet={wallet} walletName={name} decrypt={this.props.decrypt} />
    }
    const routes = AccountMap.map((item) => {
      const component = item[2](account);
      const targetUrl = this.buildLink(item);
      return <Route path={ targetUrl } key={ targetUrl } render = { component } exact = { item[3]} />
    })

    return (
      <Switch>
      { ...routes }
      < Route component = { NotFoundPage } />
        </Switch>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    ...Account.mapDispatchToProps(dispatch),
    ...Sidebar.mapDispatchToProps(dispatch)
  };
}
const ConnectedTheCoinAccount =  buildReducer<OwnProps>("coinAccount")(
  connect(createAccountSelector("coinAccount"), mapDispatchToProps)(AccountClass)
);
export { ConnectedTheCoinAccount as TheCoinAccount }