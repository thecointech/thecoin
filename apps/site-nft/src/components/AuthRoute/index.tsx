import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import { Login } from "@thecointech/shared/containers/Login";
import { isWallet } from '@thecointech/utilities/SignerIdent';
import { FormattedMessage } from 'react-intl';
import { useAccount } from '@thecointech/shared/containers/Account';

const waitingForWeb3 = {
  defaultMessage: "Connecting to your Web3 provider",
  description:"Message to display while waiting for user to complete Web3 connection"
};

// An authorized route is one that requires the use of an unlocked account
export const AuthRoute = (routeProps: RouteProps)  => {
  const account = useActiveAccount();

  // If no account, suggest adding one (?)
  // NOTE: this _looks_ like it violates the principals
  // of hooks, that every render returns equal numbers of hooks
  // but in practice the rule is not violated Because
  // the redirect means there will be no additional renders
  if (!account) {
    return <Redirect to='/addAccount' />
  }

  // Inject reducers/sagas.
  useAccount(account);
  const {signer } = account;

  // Enforce login before showing sub-page
  if (isWallet(signer)) {
    if (!signer.privateKey)
      return (
        <Login account={account} />
      );
  } else {
    if (!signer.provider) {
      // Does not have a provider on-load
      return <FormattedMessage {...waitingForWeb3} />
    }
  }

  return (
    <Route {...routeProps} />
  )
}

// const connectSigner = async (accountState: AccountState, accountActions: IActions) => {
//   const { address } = accountState;
//   const theSigner = await ConnectWeb3();
//   if ( theSigner?.address ) {
//     if (NormalizeAddress(theSigner.address) !== address) {
//       alert("Warning: cannot connect - remote account has a different address to the local store");
//       return;
//     }
//     accountActions.setSigner(theSigner);
//   }
// }
