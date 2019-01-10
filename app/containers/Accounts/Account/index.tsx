import * as React from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router-dom';
import {
  mapStateToProps,
  ContainerState as AccountsState,
} from 'containers/Accounts/selectors';
import { connect } from 'react-redux';
import NotFoundPage from 'containers/NotFoundPage';
import { Login } from './Login';
import Balance from './Balance';

type Props = RouteComponentProps & AccountsState;

class AccountClass extends React.PureComponent<Props, {}, null> {
  render() {
    const { url } = this.props.match;
    // @ts-ignore
    const accountName = this.props.match.params["accountName"];
    const account = this.props.accounts.get(accountName);
    return account === undefined ? (
      <NotFoundPage />
    ) : (
      <Switch>
        <Route
          path={`${url}/balance`}
          render={props => <Balance {...props} />}
        />
        <Route
          render={props => (
            <Login {...props} accountName={accountName} account={account} />
          )}
        />
      </Switch>
    );
  }
}

export const Account = connect(mapStateToProps)(AccountClass);
