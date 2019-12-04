import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import { buildReducer } from '@the-coin/components/containers/Account/reducer';
import * as Sidebar from '@the-coin/components/containers/PageSidebar/actions';
import { SidebarMenuItem } from '@the-coin/components/containers/PageSidebar/types';

import { Account, RouterPath, AccountProps } from '@the-coin/components/containers/Account';
import { AccountMap } from '@the-coin/components/containers/Account/types';
import { structuredSelectAccounts } from '@the-coin/components/containers/Account/selector';

import { Balance } from '@the-coin/components/containers/Balance';
import { NewAccount } from '../New';
import {
  buildMapDispatchToProps,
} from '@the-coin/components/containers/Account/actions';


interface OwnProps {}
type Props = OwnProps &
{
  Sidebar: Sidebar.DispatchProps,
  accounts: AccountMap,
}  & RouteComponentProps;

const AccountRoutes: RouterPath[] = [
  {
    name: 'Balance',
    urlFragment: '',
    creator: (routerProps: AccountProps) => ((props) => <Balance {...props} {...routerProps} />),
    exact: true,
  },
];

class ReturningClass extends React.PureComponent<Props, {}, null> {

  constructor(props: Props) {
    super(props);
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
const key = '__@create|ee25b960';

export const Returning = buildReducer<{}>(key)(
  connect(
    structuredSelectAccounts,
    buildMapDispatchToProps(key),
  )(ReturningClass),
);
