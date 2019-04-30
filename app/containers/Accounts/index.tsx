import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import { buildReducer as buildFxRateReducer } from '@the-coin/components/containers/FxRate/reducer';
import * as Sidebar from '@the-coin/components/containers/PageSidebar/actions';
import { SidebarMenuElement, SidebarMenuItem } from '@the-coin/components/containers/PageSidebar/types';

import { Account, RouterPath } from '@the-coin/components/containers/Account';
import { AccountMap } from '@the-coin/components/containers/Account/types';
import { structuredSelectAccounts } from '@the-coin/components/containers/Account/selector';

import { Balance } from '@the-coin/components/containers/Balance';
import { NewAccount } from './New';


interface OwnProps {}
type Props = OwnProps & 
{
  Sidebar: Sidebar.DispatchProps,
  accounts: AccountMap,
}  & RouteComponentProps;

const ConstantSidebarItems: SidebarMenuElement[] = [
  {
    link: {
      to: '',
      name: 'New Account',
    },
    subItems: [
      {
        link: {
          to: 'create',
          name: 'Create Account',
        },
      },
      {
        link: {
          to: 'upload',
          name: 'Upload Account',
        },
      },
    ],
  },
  {
    link: {
      to: false,
      name: 'Load',
    },
  },
];

const stripTrailingSlash = (str: string) : string => {
  return str.endsWith('/') ?
      str.slice(0, -1) :
      str;
};

const AccountRoutes: RouterPath[] = [
  ["Balance",       "",         (routerProps) => ((props) => <Balance {...props} {...routerProps} /> ), true],
  ["Transfer In",   "transferIn", (routerProps) => ((props) => <Balance {...props} {...routerProps.account} />)],
  //["Transfer Out",  "redeem",   (account) => ((props) => <Redeem {...props} account={account}/>)],
  // ["Transfer To",   "transfer", (account) => ((props) => <Transfer {...props} />)],
  // ["Pay Bills",     "billPay",  (account) => ((props) => <Transfer {...props} />)],
  // ["Settings",     "settings",  (account) => ((props) => <Settings {...props} account={account} />)],
]

class AccountsClass extends React.PureComponent<Props, {}, null> {
  MappedConstantItems: SidebarMenuElement[];

  constructor(props) {
    super(props);

    const { url } = this.props.match;
    this.MappedConstantItems = this.mapMenuItems(ConstantSidebarItems, stripTrailingSlash(url));
  }

  mapMenuItems(item: SidebarMenuItem[], url: string): SidebarMenuItem[] {
    return item.map(element => {
      if (element.link.to !== false) {
        const mapped: SidebarMenuItem = {
          link: {
            ...element.link,
            to: `${url}/${element.link.to}`,
          },
          subItems: element.subItems
            ? this.mapMenuItems(element.subItems, url)
            : undefined
        };
        return mapped;
      }
      return element;
    });
  }

  componentDidMount() {
    const {match, accounts, Sidebar} = this.props;
    const url = stripTrailingSlash(match.url);
    const accountLinks: SidebarMenuElement[] = [];
    Object.entries(accounts).forEach(([name, _]) => {
      accountLinks.push({
        link: {
          to: `${url}/e/${name}`,
          name
        }
      });
    });

    Sidebar.setItems(this.MappedConstantItems.concat(accountLinks));
  }


  render() {
    const { match, accounts } = this.props;
    const { url } = match;
    const createLink = this.MappedConstantItems[0];

    let accountRoutes = Array.from(Object.entries(accounts), ([key, value]) => {
      const accountUrl = `${url}/e/${key}`;
      return <Route key={key} path={accountUrl} render={(state) => <Account accountName={key} accountMap={AccountRoutes} url={accountUrl} /> } />
    });
    return (
      <Switch>
        {accountRoutes}
        <Route render={(state) => <NewAccount createLink={createLink} url={url} /> } />
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
