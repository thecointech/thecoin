import * as React from 'react';
import { Wallet } from 'ethers';

type Props = {
  account: Wallet
};

class Balance extends React.PureComponent<Props, {}, null> {
  render() {
    return <div>You Poor, dumbass</div>;
  }
}

export default Balance;
