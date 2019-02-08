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
import { Purchase } from './Purchase';

type Props = RouteComponentProps & AccountsState;

class AccountClass extends React.PureComponent<Props, {}, null> {
  render() {
    const { url } = this.props.match;
    // @ts-ignore
    const accountName = this.props.match.params["accountName"];
    const account = this.props.accounts.get(accountName);
    if (account === undefined) {
      return <NotFoundPage />;
    }
    else if (!account.privateKey) {
      return <Login accountName={accountName} account={account} />
    }
    return (
      <Switch>
        <Route
          path={`${url}/purchase`}
          render={props => <Purchase {...props} account={account!} />}
        />
        <Route
          render={props => <Balance {...props} account={account!} />}
        />
        <Route component={NotFoundPage} />
      </Switch>
    );
  }
}

export const Account = connect(mapStateToProps)(AccountClass);
