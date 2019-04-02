import NotFoundPage from 'containers/NotFoundPage';
import * as Sidebar from 'containers/PageSidebar/actions';
import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ApplicationRootState } from 'types';
import { selectActiveAccount } from '../AccountSelector/selectors';
import { Balance } from './Balance';
import { Login } from './Login';
import { Purchase } from './Purchase';
import { Redeem } from './Redeem';
import { Transfer } from './Transfer';
import { Settings } from './Settings';
import { ContainerState as AccountState } from './types';

type OwnProps = {
  url: string
} 

type Props = OwnProps & AccountState & Sidebar.DispatchProps;

type RouterPath = [string, string, (props: AccountState) => (props: any) => React.ReactNode, boolean?]
const AccountMap : RouterPath[] = [
  ["Balance",       "",         (account) => ((props) => <Balance {...props} {...account} /> ), true],
  ["Transfer In",   "purchase", (account) => ((props) => <Purchase {...props} address={account.wallet.address} />)],
  ["Transfer Out",  "redeem",   (account) => ((props) => <Redeem {...props} account={account}/>)],
  ["Transfer To",   "transfer", (account) => ((props) => <Transfer {...props} />)],
  ["Pay Bills",     "billPay",  (account) => ((props) => <Transfer {...props} />)],
  ["Settings",     "settings",  (account) => ((props) => <Settings {...props} account={account} />)],
]

//const p : RouterPath = AccountMap[0];
class AccountClass extends React.PureComponent<Props, {}, null> {

  buildLink(url: string, item: RouterPath)
  {
    return url.endsWith('/') ? 
      `${url}${item[1]}` :
      `${url}/${item[1]}`

  }

  componentDidMount()
  {
    const { url, name, wallet } = this.props;

    if (wallet.privateKey)
    {
      const accountLinks = AccountMap.map((item) => {
        return {
          link: {
            name: item[0],
            to: this.buildLink(url, item)
          }
        }
      })
      this.props.setSubItems(name, accountLinks)  
    }
    else {
      this.props.setSubItems("", []);
    }
  }

  render() {
    const { url, ...account } = this.props;
    const { wallet, name } = account;
    if (wallet === null) {
      return <NotFoundPage />;
    }
    else if (!wallet.privateKey) {
      return <Login account={wallet} accountName={name}/>
    }
    const routes = AccountMap.map((item) => {
      const component = item[2](account);
      const targetUrl = this.buildLink(url, item);
      return <Route path={targetUrl} render={component} exact={item[3]} />
    })

    return (
      <Switch>
        {...routes}
        <Route component={NotFoundPage} />
      </Switch>
    );
  }
}

const mapStateToProps = (state: ApplicationRootState): AccountState => {
  const activeAccount = selectActiveAccount(state);
  // We assume we always have an account to work on.
  return {
    ...activeAccount!
  }
}

export const Account = connect(mapStateToProps, Sidebar.mapDispatchToProps)(AccountClass);