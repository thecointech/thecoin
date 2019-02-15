import * as React from 'react';
import { Wallet, Contract } from 'ethers';

type Props = {
  account: Wallet
  contract: Contract
};

class Balance extends React.PureComponent<Props, {}, null> {
  render() {
    return <div>You Poor, dumbass</div>;
  }
}

export { Balance };
