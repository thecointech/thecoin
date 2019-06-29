import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { Login } from '../../containers/Login';
import { NotFoundPage } from '../../containers/NotFoundPage'

import { ApplicationBaseState } from '../../types';
import * as Sidebar from '../PageSidebar/actions';
import { SidebarMenuItem, FindItem } from '../PageSidebar/types';

import { ConnectWeb3 } from './Web3'
import { AccountState } from './types';
import { buildReducer } from './reducer'
import { createAccountSelector } from './selector';
import * as Account from './actions';
import { AsWallet } from './storageSync';


interface AccountProps {
  account: AccountState;
  dispatch: Account.DispatchProps;
}
type PageCreator = (props: AccountProps) => (props: any) => React.ReactNode;
type RouterPath = {
  name: string,
  urlFragment: string,
  creator: PageCreator,
  exact?: boolean
}

interface OwnProps {
  url: string;
  accountName: string;
  accountMap: RouterPath[];
  addressMatch?: (address: string) => boolean;
}

type Props = OwnProps & AccountProps & Sidebar.DispatchProps;

class AccountClass extends React.PureComponent<Props, {}, null> {

  constructor(props: Props) {
    super(props);

    this.generateSubItems = this.generateSubItems.bind(this);
  }

  buildLink(item: RouterPath) {
    const {url} = this.props;
    return url.endsWith('/') ?
      `${url}${item.urlFragment}` :
      `${url}/${item.urlFragment}`
  }

  generateSubItems(items: SidebarMenuItem[], state: ApplicationBaseState): SidebarMenuItem[] {
    const { accountMap, accountName, account } = this.props;
    if (account.signer) // Not default:
    {
      const item = FindItem(items, accountName);
      if (item) 
      {
        item.subItems = Array.from(accountMap.map((item) => {
          return {
            link: {
              name: item.name,
              to: this.buildLink(item)
            }
          }
        }))
      }
    }
    return items;
  }

  componentDidMount() {
    this.props.addGenerator(this.props.accountName, this.generateSubItems);

    // Is this a remote account?
    const {signer} = this.props.account;
    if (signer && !AsWallet(signer) && !signer.provider)
    {
      this.connectSigner()
    }
  }

  componentWillUnmount() {
    this.props.removeGenerator(this.props.accountName)
  }

  async connectSigner() {
    const {signer, name} = this.props.account;
    const theSigner = await ConnectWeb3();
    if (signer && theSigner) {
      if (theSigner.address != signer.address) {
        return;
      }
      this.props.dispatch.setSigner(name, theSigner);
    }
  }

  render() {
    const { accountMap, account, dispatch } = this.props;
    const { signer, name } = account;
    if (signer === null) {
      //return <UploadWallet onSelect={this.onFileUpload} />;
      return <div>FixMe</div>;
    }
    else {
      const asWallet = AsWallet(signer);
      if (asWallet) 
      {
        if (!asWallet.privateKey)
          return <Login wallet={asWallet} walletName={name} decrypt={dispatch.decrypt} />
      }
      else 
      {
        if (!signer.provider) // Does not have a provider on-load
        {
          return <div>Connecting to your Web3 provider</div>
        }
      }
    } 

    const accountArgs = {
      account,
      dispatch
    }
    const routes = accountMap.map((item) => {
      const component = item.creator(accountArgs);
      const targetUrl = this.buildLink(item);
      return <Route path={ targetUrl } key={ targetUrl } render = { component } exact = { item.exact } />
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

var __AccountMap : { [name: string]: React.ComponentType<OwnProps> }= {};
function NamedAccount(props: OwnProps) {
  const { accountName } = props;
  if (!__AccountMap[accountName]) {
    
    const accountDispatch = Account.buildMapDispatchToProps(accountName);
    const mapDispatchToProps = function(dispatch: Dispatch) {
      return {
        dispatch: accountDispatch(dispatch),
        ...Sidebar.mapDispatchToProps(dispatch)
      };
    }
    const mapPropsToState = function (state: ApplicationBaseState) {
      return {
        account: createAccountSelector(accountName)(state)
      }
    }

    __AccountMap[accountName] = buildReducer<OwnProps>(accountName)(
      connect(mapPropsToState, mapDispatchToProps)(AccountClass)
    );
  }
  return React.createElement(__AccountMap[accountName], props);
}  

export { NamedAccount as Account, RouterPath, PageCreator, AccountProps }