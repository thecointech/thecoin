import * as React from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  SidebarMenuElement,
  SidebarMenuItem,
} from 'containers/PageSidebar/types';
import * as Sidebar from 'containers/PageSidebar/actions';
import AccountCreate from './Create';
import { buildReducer } from './reducer';
import { ContainerState } from './types';
import { mapStateToProps } from './selectors';
import { AccountSelector } from './AccountSelector';

interface OwnProps {}
type Props = OwnProps &
  ContainerState &
  RouteComponentProps &
  Sidebar.DispatchProps;

const ConstantSidebarItems: SidebarMenuElement[] = [
  {
    link: {
      to: '',
      name: 'New Account',
    },
    subItems: [
      {
        link: {
          to: '',
          name: 'Create Account',
        },
      },
      {
        link: {
          to: '?upload',
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
            : undefined,
        };
        return mapped;
      }
      return element;
    });
  }

  componentDidMount() {
    const url = stripTrailingSlash(this.props.match.url);
    const accountLinks: SidebarMenuElement[] = [];
    this.props.wallets.forEach((account, name) => {
      accountLinks.push({
        link: {
          to: `${url}/${name}`,
          name,
        },
      });
    });

    this.props.setItems(this.MappedConstantItems.concat(accountLinks));
  }

  render() {
    const { url } = this.props.match;
    const { wallets } = this.props;
    return (
      <Switch>
        <Route path={`${url}/:accountName`} render={
          (props) => <AccountSelector {...props} wallets={wallets} /> 
        } />
        <Route path={`${url}/?upload`} component={AccountCreate} />
        <Route component={AccountCreate} />
      </Switch>
    );
  }
}

export const Accounts = buildReducer<OwnProps>()(
  connect(
    mapStateToProps,
    Sidebar.mapDispatchToProps,
  )(AccountsClass),
);
