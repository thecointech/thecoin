import * as React from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router-dom';
import * as Sidebar from 'containers/PageSidebar/actions';
import AccountCreate from './Create';
import Account from './Account';
import { buildReducer } from './reducer';
import { connect } from 'react-redux';
import { SidebarMenuItem } from 'containers/PageSidebar/types';

interface OwnProps {}
type Props = OwnProps & RouteComponentProps & Sidebar.DispatchProps;

const ConstantSidebarItems : SidebarMenuItem[] = [
  {
    link: {
      to: "create",
      name: "New Account"
    },
    subItems: [
      {
        link: {
          to: "create",
          name: "Create Account"
        },
      },
      {
        link: {
          to: "upload",
          name: "Upload Account"
        }
      }
    ]
  }
];

class Accounts extends React.PureComponent<Props, {}, null> {

  componentDidMount() {
    this.props.setItems(ConstantSidebarItems);
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
    null, 
    Sidebar.mapDispatchToProps
  )(Accounts));
