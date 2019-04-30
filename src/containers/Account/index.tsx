import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { Login } from '../../containers/Login';
import { NotFoundPage } from '../../containers/NotFoundPage'

import { ApplicationBaseState } from '../../types';
import * as Sidebar from '../PageSidebar/actions';
import { SidebarMenuItem, FindItem } from '../PageSidebar/types';

import { AccountState } from './types';
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
      `${url}${item[1]}` :
      `${url}/${item[1]}`
  }

  generateSubItems(items: SidebarMenuItem[], state: ApplicationBaseState): SidebarMenuItem[] {
    const { accountMap, accountName, account } = this.props;
    if (account.wallet) // Not default:
    {
      const item = FindItem(items, accountName);
      if (item) 
      {
        item.subItems = Array.from(accountMap.map((item) => {
          return {
            link: {
              name: item[0],
              to: this.buildLink(item)
            }
          }
        }))
      }
    }
    return items;
  }

  componentDidMount() {
    this.props.addGenerator(this.props.accountName, this.generateSubItems)
  }

  componentWillUnmount() {
    this.props.removeGenerator(this.props.accountName)
  }

  render() {
    const { accountMap, account, dispatch } = this.props;
    const { wallet, name } = account;
    if (wallet === null) {
      //return <UploadWallet onSelect={this.onFileUpload} />;
      return <div>FixMe</div>;
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

export { NamedAccount as Account, RouterPath }