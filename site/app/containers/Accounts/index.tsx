import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import { buildReducer as buildFxRateReducer } from '@the-coin/components/containers/FxRate/reducer';
import * as Sidebar from '@the-coin/components/containers/PageSidebar/actions';
import { SidebarMenuItem, MapMenuItems } from '@the-coin/components/containers/PageSidebar/types';

import { Account, RouterPath, AccountProps } from '@the-coin/components/containers/Account';
import { AccountMap } from '@the-coin/components/containers/Account/types';
import { structuredSelectAccounts } from '@the-coin/components/containers/Account/selector';

import { ApplicationRootState } from 'types';
import { Balance } from '@the-coin/components/containers/Balance';
import { NewAccount, NewAccountName } from './NewAccount';
import { Redeem } from './Redeem';
import { Transfer } from './Transfer';
import { Settings } from './Settings';
import { Purchase } from './Purchase';
import { BillPayments } from './BillPayments';


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
      name: 'Accounts',
    },
  },
];

const AccountRoutes: RouterPath[] = [
  {
    name: 'Balance',
    urlFragment: '',
    creator: (routerProps: AccountProps) => ((props) => <Balance {...props} {...routerProps} />),
    exact: true,
  },
  {
    name: 'Transfer In',
    urlFragment: 'transferIn',
    creator: (routerProps: AccountProps) => ((props) => <Purchase {...props} signer={routerProps.account.signer!} />),
  },
  {
    name: 'Transfer Out',
    urlFragment: 'redeem',
    creator: (routerProps: AccountProps) => ((props) => <Redeem {...props} account={routerProps.account} />),
  },
  {
    name: 'Transfer To',
    urlFragment: 'transfer',
    creator: (routerProps: AccountProps) => ((props) => <Transfer {...props} account={routerProps.account} />),
  },
  {
    name: 'Pay Bills',
    urlFragment: 'billPay',
    creator: (routerProps: AccountProps) => ((props) => <BillPayments {...props} account={routerProps.account} />),
  },
  {
    name: 'Settings',
    urlFragment: 'settings',
    creator: (routerProps: AccountProps) => ((props) => <Settings {...props} account={routerProps.account} />),
  },
];

class AccountsClass extends React.PureComponent<Props, {}, null> {

  constructor(props: Props) {
    super(props);

    this.generateSidebarItems = this.generateSidebarItems.bind(this);
  }

  public doGenerateSidebarItems(accounts: AccountMap) {
    if (!accounts) {
      return [];
    }
    const accountLinks: SidebarMenuItem[] = [];
    Object.entries(accounts).forEach(([name, _]) => {
      accountLinks.push({
        link: {
          to: `e/${name}`,
          name,
        },
      });
    });
    return accountLinks;
  }

  public generateSidebarItems(state: ApplicationRootState): SidebarMenuItem[] {

    // Pull accounts directly from State.  This is because
    // we may be called mid-change on the state, and our local
    // state will not yet be updated (but the incoming state will be)
    const { accounts } = structuredSelectAccounts(state);
    const { match } = this.props;
    const accountLinks = this.doGenerateSidebarItems(accounts);
    const allItems = ConstantSidebarItems.concat(accountLinks);
    return MapMenuItems(allItems, match.url);
  }

  public componentDidMount() {
    const { Sidebar} = this.props;
    Sidebar.setRootGenerator(this.generateSidebarItems);
  }

  public componentWillUnmount() {
    const { Sidebar} = this.props;
    Sidebar.setRootGenerator(null);
  }

  public render() {
    const { match, accounts } = this.props;
    const { url } = match;

    const accountRoutes = Array.from(Object.entries(accounts), ([key, value]) => {
      const accountUrl = `${url}/e/${key}`;
      return <Route key={key} path={accountUrl} render={(state) => <Account accountName={key} accountMap={AccountRoutes} url={accountUrl} />} />;
    });
    return (
      <Switch>
        {accountRoutes}
        <Route render={(state) => <NewAccount url={url} />} />
      </Switch>
    );
  }
}

function mapDispathToProps(dispatch) {
  return {
    Sidebar: Sidebar.mapDispatchToProps(dispatch),
  };
}

export const Accounts = buildFxRateReducer<OwnProps>()(
  connect(
    structuredSelectAccounts,
    mapDispathToProps,
  )(AccountsClass),
);
