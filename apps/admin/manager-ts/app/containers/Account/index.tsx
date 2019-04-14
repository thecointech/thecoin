import * as Sidebar from 'containers/PageSidebar/actions';
import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { Login } from './Login';
import { UploadWallet } from './UploadWallet';
import { NotFoundPage } from 'containers/NotFoundPage'
import { ApplicationRootState } from 'types';

import { ContainerState as AccountState } from './types';
import { buildReducer } from './reducer'
import { createAccountSelector } from './selector';
import * as Account from './actions';


interface AccountProps {
  account: AccountState;
  dispatch: Account.DispatchProps;
}
type RouterPath = [string, string, (props: AccountProps) => (props: any) => React.ReactNode, boolean?]

interface OwnProps {
  url: string;
  accountName: keyof ApplicationRootState;
  accountMap: RouterPath[];
  addressMatch?: (address: string) => boolean;
}

type Props = OwnProps & AccountProps & Sidebar.DispatchProps;

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

  // TODO: remove once utilities updated
  IsValidAddress = (address: string) => address.match(/^(0x)?[a-g0-9]{40}$/i) != null

  async onFileUpload(jsonObject) {
    const { address } = jsonObject;
    const { addressMatch } = this.props;
    const isValid = addressMatch ? 
      addressMatch(address) :
      this.IsValidAddress(address);

    if (isValid)
      this.props.dispatch.setWallet(jsonObject);
    else {
      alert("Bad Wallet");
    }
  }

  componentDidMount() {
    const { account, dispatch, accountName, accountMap } = this.props;
    const { wallet } = account;

    const accountLinks = accountMap.map((item) => {
      return {
        link: {
          name: item[0],
          to: this.buildLink(item)
        }
      }
    })
    this.props.setSubItems(accountName, accountLinks)
    if(!wallet) {
      dispatch.setName(accountName);
    }
  }

  render() {
    const { accountMap, account, dispatch } = this.props;
    const { wallet, name } = account;
    if (wallet === null) {
      return <UploadWallet onSelect={this.onFileUpload} />;
    }
    else if (!wallet.privateKey) {
      return <Login wallet={wallet} walletName={name} decrypt={dispatch.decrypt} />
    }

    const accountArgs = {
      account,
      dispatch
    }
    const routes = accountMap.map((item) => {
      const component = item[2](accountArgs);
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
        dispatch: accountDispatch(dispatch),
        ...Sidebar.mapDispatchToProps(dispatch)
      };
    }
    const mapPropsToState = function (dispatch) {
      return {
        account: createAccountSelector(accountName)(dispatch)
      }
    }

    __AccountMap[accountName] = buildReducer<OwnProps>(accountName)(
      connect(mapPropsToState, mapDispatchToProps)(AccountClass)
    );
  }
  return React.createElement(__AccountMap[accountName], props);
}  

export { NamedAccount as Account, RouterPath }