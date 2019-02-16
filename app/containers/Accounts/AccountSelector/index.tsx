import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { Wallet } from 'ethers';

import { Account } from '../Account';
import { DispatchProps, mapDispatchToProps } from './actions';
import { buildReducer } from './reducer';

type OwnProps = {
  wallets: Map<string, Wallet>
} 

type Props = OwnProps & RouteComponentProps & DispatchProps;

class AccountSelectorClass extends React.PureComponent<Props, {}, null> {

  // Fixes `AccountSelectorClass` uses `getDerivedStateFromProps` but its initial state is undefined.
  state = {};

  static getDerivedStateFromProps(props : Props, state) {
    const { match, wallets } = props;
    const accountName = match.params["accountName"];
    const wallet = wallets.get(accountName);
    if (wallet) {
      props.setActiveAccount(accountName, wallet);
    }
    return state;
  }

  render() {
    const { url } = this.props.match;
    return (
      <Account url={url}/>
    );
  }
}

export const AccountSelector = buildReducer<OwnProps>()(
  connect(null, mapDispatchToProps)(AccountSelectorClass)
);
