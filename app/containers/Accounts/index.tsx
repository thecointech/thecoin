import * as React from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { SidebarMenuItem } from 'containers/PageSidebar/types';
import * as Sidebar from 'containers/PageSidebar/actions';
import AccountCreate from './Create';
import Account from './Account';
import { buildReducer } from './reducer';
import { ContainerState } from './types';
import { mapStateToProps } from './selectors';

interface OwnProps {}
type Props = OwnProps &
  ContainerState &
  RouteComponentProps &
  Sidebar.DispatchProps;

const ConstantSidebarItems: SidebarMenuItem[] = [
  {
    link: {
      to: 'create',
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
];

class Accounts extends React.PureComponent<Props, {}, null> {
  componentDidMount() {
    const accountLinks: SidebarMenuItem[] = [];
    this.props.accounts.forEach((account, name) => {
      accountLinks.push({
        link: {
          to: `/account/${name}`,
          name,
        },
      });
    });
    this.props.setItems(ConstantSidebarItems.concat(accountLinks));
  }

  render() {
    const { url } = this.props.match;
    return (
      <Switch>
        <Route path={`${url}/:accountName`} component={Account} />
        <Route component={AccountCreate} />
      </Switch>
    );
  }
}

export default buildReducer<OwnProps>()(
  connect(
    mapStateToProps,
    Sidebar.mapDispatchToProps,
  )(Accounts),
);
