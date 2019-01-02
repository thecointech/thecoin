import * as React from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router-dom';
import Login from './Login';
import Balance from './Balance'

type Props = RouteComponentProps;

class Accounts extends React.PureComponent<Props, {}, null> {
  render() {
    const { url } = this.props.match;
    return (
      <Switch>
        <Route path={`${url}/balance`} component={Balance} />
        <Route component={Login} />
      </Switch>
    );
  }
}

export default Accounts;
