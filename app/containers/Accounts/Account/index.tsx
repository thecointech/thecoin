import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import NotFoundPage from 'containers/NotFoundPage';
import { Login } from './Login';
import { Balance } from './Balance';
import { Purchase } from './Purchase';
import { ContainerState as AccountState } from './types'
import { selectActiveAccount } from '../AccountSelector/selectors';
import { ApplicationRootState } from 'types';

type OwnProps = {
  url: string
} 

type Props = OwnProps & AccountState;

class AccountClass extends React.PureComponent<Props, {}, null> {

  render() {
    const { wallet, name, contract, url } = this.props;
    if (wallet === null) {
      return <NotFoundPage />;
    }
    else if (!wallet.privateKey) {
      return <Login account={wallet} accountName={name}/>
    }
    return (
      <Switch>
        <Route
          path={`${url}/purchase`}
          render={props => <Purchase {...props} account={wallet!} />}
        />
        <Route
          render={props => <Balance {...props} account={wallet!} contract={contract!}/>}
        />
        <Route component={NotFoundPage} />
      </Switch>
    );
  }
}

const mapStateToProps = (state: ApplicationRootState): AccountState => {
  const activeAccount = selectActiveAccount(state);
  // We assume we always have an account to work on.
  return {
    ...activeAccount!
  }
}

export const Account = connect(mapStateToProps)(AccountClass);