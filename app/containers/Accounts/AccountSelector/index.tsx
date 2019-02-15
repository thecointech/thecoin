import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';

import { DispatchProps, mapDispatchToProps } from '../actions';
import { Account } from '../Account';

type OwnProps = {} 

type Props = RouteComponentProps & OwnProps & DispatchProps;

class AccountSelectorClass extends React.PureComponent<Props, {}, null> {

  state = {};
  StateType = typeof this.state;

  static getDerivedStateFromProps(props : Props, state) {
    const { params } = props.match;
    const accountName = params["accountName"];
    props.setActiveAccount(accountName);
    return state;
  }

  render() {
    const { url } = this.props.match;
    return (
      <Account url={url}/>
    );
  }
}

export const AccountSelector = connect(null, mapDispatchToProps)(AccountSelectorClass)
