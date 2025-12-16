import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { isLocal } from '@thecointech/signers';
import { defineMessage, FormattedMessage } from 'react-intl';
import { AccountMap } from '@thecointech/redux-accounts';
import { Login } from '../Login';
import { Account } from '../Account';

const waitingForWeb3 = defineMessage({
  defaultMessage: "Connecting to your Web3 provider",
  description: "Message to display while waiting for user to complete Web3 connection"
});

// AuthLayout acts as a wrapper for all protected child routes
export const AuthLayout: React.FC = () => {
  const account = AccountMap.useActive();
  const location = useLocation();

  // 1. Check for Active Account (Unauthenticated Redirection)
  if (!account) {
    // Navigate to the login/addAccount page, preserving the current path
    // in state/search so the user can return after logging in.
    return <Navigate to={`/addAccount?from=${location.pathname}`} replace />;
  }

  // 2. Inject Reducers/Sagas (Must be done unconditionally after the account check)
  Account(account.address).useStore();
  const { signer } = account;

  // 3. Enforce Login/Provider Check (Conditional Login Screen)
  if (isLocal(signer)) {
    if (!signer.privateKey) {
      // Local account needs private key login
      return <Login account={account} />;
    }
  } else {
    if (!signer.provider) {
      // Non-local (Web3) provider needs connection
      return <FormattedMessage {...waitingForWeb3} />;
    }
  }

  // 4. All checks pass: Render the matched child route content
  return <Outlet />;
};
