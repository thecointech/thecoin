import React from 'react';
import { Redirect, Route, RouteProps, Switch } from 'react-router-dom';
import { isLocal } from '@thecointech/signers';
import { defineMessage, FormattedMessage } from 'react-intl';
import { useActiveAccount } from '../AccountMap';
import { Login } from "../Login";
import { useAccount } from '../Account';

const waitingForWeb3 = defineMessage({
  defaultMessage: "Connecting to your Web3 provider",
  description:"Message to display while waiting for user to complete Web3 connection"
});

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

  return (
    <Route {...routeProps} />
  )
}

type AuthSwitchProps = {
  auth?: Record<string, React.ComponentType>,
  open?: Record<string, React.ComponentType>,
  fallback?: React.ComponentType,
  path: string,
};

export const AuthSwitch = ({path, auth, open, fallback} : AuthSwitchProps) => {
  const trimmed = path.endsWith('/') ? path.slice(0, -1) : path;
  return (
    <Switch>
      {open ? Object.entries(open).map(
        ([key, component]) => <Route key={key} path={`${trimmed}/${key}`} component={component} />
      ) : null}
      {auth ? Object.entries(auth).map(
        ([key, component]) => <AuthRoute key={key} path={`${trimmed}/${key}`} component={component} />
      ) : null}
      {fallback ? <Route component={fallback} /> : null}
    </Switch>
  )
}
