import * as React from 'react';
import { Wallet } from 'ethers';

type Props = {
  account: Wallet
};

export class Purchase extends React.PureComponent<Props, {}, null> {
  render() {
    return <div>Gimme Money!!!</div>;
  }
}