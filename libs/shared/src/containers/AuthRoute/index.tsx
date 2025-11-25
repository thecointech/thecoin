import React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { isLocal } from '@thecointech/signers';
import { defineMessage, FormattedMessage } from 'react-intl';
import { AccountMap } from '../AccountMap';
import { Login } from "../Login";
import { Account } from '../Account';

const waitingForWeb3 = defineMessage({
  defaultMessage: "Connecting to your Web3 provider",
  description: "Message to display while waiting for user to complete Web3 connection"
});

// An authorized route is one that requires the use of an unlocked account
export const AuthRoute = ({ element }: { element: React.ReactElement }) => {
  const account = AccountMap.useActive();

  // If no account, suggest adding one (?)
  // NOTE: this _looks_ like it violates the principals
  // of hooks, that every render returns equal numbers of hooks
  // but in practice the rule is not violated Because
  // the redirect means there will be no additional renders
  if (!account) {
    return <Navigate to='/addAccount' replace />
  }

  // Inject reducers/sagas.
  Account(account.address).useStore();
  const { signer } = account;

  // Enforce login before showing sub-page
  if (isLocal(signer)) {
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

  return element;
}

type AuthSwitchProps = {
  auth?: Record<string, React.ComponentType>,
  open?: Record<string, React.ComponentType>,
  Fallback?: React.ComponentType,
  path: string,
};

export const AuthSwitch = ({ path, auth, open, Fallback }: AuthSwitchProps) => {
  const trimmed = path.endsWith('/') ? path.slice(0, -1) : path;
  return (
    <Routes>
      {open ? Object.entries(open).map(
        ([key, Component]) => <Route key={key} path={`${trimmed}/${key}`} element={<Component />} />
      ) : null}
      {auth ? Object.entries(auth).map(
        ([key, Component]) => <Route key={key} path={`${trimmed}/${key}`} element={<AuthRoute element={<Component />} />} />
      ) : null}
      {Fallback ? <Route path="*" element={<Fallback />} /> : null}
    </Routes>
  )
}
