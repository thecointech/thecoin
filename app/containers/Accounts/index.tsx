import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import { buildReducer as buildFxRateReducer } from '@the-coin/components/containers/FxRate/reducer';
import * as Sidebar from '@the-coin/components/containers/PageSidebar/actions';
import { SidebarMenuItem, MapMenuItems } from '@the-coin/components/containers/PageSidebar/types';

import { Account, RouterPath } from '@the-coin/components/containers/Account';
import { AccountMap } from '@the-coin/components/containers/Account/types';
import { structuredSelectAccounts } from '@the-coin/components/containers/Account/selector';

import { ApplicationRootState } from 'types';
import { Balance } from '@the-coin/components/containers/Balance';
import { NewAccount, NewAccountName } from './New';
import { Redeem } from './Redeem';
import { Transfer } from './Transfer';
import { Settings } from './Settings';
import { Purchase } from './Purchase';


interface OwnProps {}
type Props = OwnProps & 
{
  Sidebar: Sidebar.DispatchProps,
  accounts: AccountMap,
}  & RouteComponentProps;

const ConstantSidebarItems: SidebarMenuItem[] = [
  {
    link: {
      to: '',
      name: NewAccountName,
    },
  },
  {
    link: {
      to: false,
      name: 'Divider',
    },
  },
];

const AccountRoutes: RouterPath[] = [
  ["Balance",       "",         (routerProps) => ((props) => <Balance {...props} {...routerProps} /> ), true],
  ["Transfer In",   "transferIn", (routerProps) => ((props) => <Purchase {...props} address={routerProps.account.wallet!.address} />)],
  ["Transfer Out",  "redeem",   (routerProps) => ((props) => <Redeem {...props} account={routerProps.account} />)],
  ["Transfer To",   "transfer", (routerProps) => ((props) => <Transfer {...props} />)],
  ["Pay Bills",     "billPay",  (routerProps) => ((props) => <Transfer {...props} />)],
  ["Settings",     "settings",  (routerProps) => ((props) => <Settings {...props} account={routerProps.account} />)],
]

class AccountsClass extends React.PureComponent<Props, {}, null> {

  constructor(props: Props) {
    super(props);

    this.generateSidebarItems = this.generateSidebarItems.bind(this);
  }

  generateSidebarItems(state: ApplicationRootState): SidebarMenuItem[] {
    // Pull accounts directly from State.  This is because
    // we may be called mid-change on the state, and our local
    // state will not yet be updated (but the incoming state will be)
    const { accounts } = state;
    const { match } = this.props;
    const accountLinks: SidebarMenuItem[] = [];
    Object.entries(accounts).forEach(([name, _]) => {
      accountLinks.push({
        link: {
          to: `e/${name}`,
          name
        }
      });
    });
    return MapMenuItems(ConstantSidebarItems.concat(accountLinks), match.url);
  } 

  componentDidMount() {
    const { Sidebar} = this.props;
    Sidebar.setRootGenerator(this.generateSidebarItems);
  }

  componentWillUnmount() {
    const { Sidebar} = this.props;
    Sidebar.setRootGenerator(null);
  }

  render() {
    const { match, accounts } = this.props;
    const { url } = match;
    
    let accountRoutes = Array.from(Object.entries(accounts), ([key, value]) => {
      const accountUrl = `${url}/e/${key}`;
      return <Route key={key} path={accountUrl} render={(state) => <Account accountName={key} accountMap={AccountRoutes} url={accountUrl} /> } />
    });
    return (
      <Switch>
        {accountRoutes}
        <Route render={(state) => <NewAccount url={url} /> } />
      </Switch>
    );
  }
}

function mapDispathToProps(dispatch) {
  return {
    Sidebar: Sidebar.mapDispatchToProps(dispatch),
  }
}

export const Accounts = buildFxRateReducer<OwnProps>()(
  connect(
    structuredSelectAccounts,
    mapDispathToProps,
  )(AccountsClass),  
);
