import * as Sidebar from 'containers/PageSidebar/actions';
import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { Login } from 'Containers/Login';
import { ContainerState as AccountState } from 'Containers/Account/types';
import { NotFoundPage } from 'containers/NotFoundPage'
import { buildReducer } from 'containers/Account/reducer'
import { createAccountSelector } from 'containers/Account/selector';
import * as Account from 'containers/Account/actions';
import { UploadWallet } from 'containers/UploadWallet';
import { ApplicationRootState } from 'types';

type RouterPath = [string, string, (props: AccountState) => (props: any) => React.ReactNode, boolean?]
interface OwnProps {
  url: string;
  accountName: keyof ApplicationRootState;
  accountMap: RouterPath[];
  addressMatch?: (address: string) => boolean;
}
type Props = OwnProps & AccountState & Sidebar.DispatchProps & Account.DispatchProps;


class AccountClass extends React.PureComponent<Props, {}, null> {

  constructor(props) {
    super(props);
    this.onFileUpload = this.onFileUpload.bind(this);
  }

  buildLink(item: RouterPath) {
    const {url} = this.props;
    return url.endsWith('/') ?
      `${url}${item[1]}` :
      `${url}/${item[1]}`

  }

  // TODO: move to utilities
  IsValidAddress = (address: string) => address.match(/^[a-g0-9]40$/i) != null

  async onFileUpload(jsonObject) {
    const { address } = jsonObject;
    const { addressMatch } = this.props;
    const isValid = addressMatch ? 
      addressMatch(address) :
      this.IsValidAddress(address);

    if (isValid)
      this.props.setWallet(jsonObject);
    else {
      alert("Bad Wallet");
    }
  }

  componentDidMount() {
    const { wallet, accountName, accountMap } = this.props;

    if (wallet && wallet.privateKey) {
      const accountLinks = accountMap.map((item) => {
        return {
          link: {
            name: item[0],
            to: this.buildLink(item)
          }
        }
      })
      this.props.setSubItems(accountName, accountLinks)
    }
    else {
      this.props.setName(accountName);
      this.props.setSubItems("", []);
    }
  }

  render() {
    const { url, accountName, accountMap, addressMatch, ...account } = this.props;
    const { wallet, name } = account;
    if (wallet === null) {
      return <UploadWallet onSelect={this.onFileUpload} />;
    }
    else if (!wallet.privateKey) {
      return <Login wallet={wallet} walletName={name} decrypt={this.props.decrypt} />
    }
    const routes = accountMap.map((item) => {
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



// Fancy-pants mapper returns the component with the appropriate reducer applied
var __AccountMap = {};
function NamedAccount(props: OwnProps) {
  const { accountName } = props;
  if (!__AccountMap[accountName]) {
    
    const accountDispatch = Account.buildMapDispatchToProps(accountName);
    const mapDispatchToProps = function(dispatch) {
      return {
        ...accountDispatch(dispatch),
        ...Sidebar.mapDispatchToProps(dispatch)
      };
    }

    __AccountMap[accountName] = buildReducer<OwnProps>(accountName)(
      connect(createAccountSelector(props.accountName), mapDispatchToProps)(AccountClass)
    );
  }
  return React.createElement(__AccountMap[accountName], props);
}  

export { NamedAccount as Account, RouterPath }