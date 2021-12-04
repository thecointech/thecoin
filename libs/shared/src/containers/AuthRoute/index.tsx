import React, { ComponentType } from 'react';
import { Redirect, Route, RouteComponentProps, RouteProps, Switch } from 'react-router-dom';
import { isLocal } from '@thecointech/signers';
import { defineMessage, FormattedMessage } from 'react-intl';
import { AccountMap } from '../AccountMap';
import { Login } from "../Login";
import { Account } from '../Account';
import { Location } from 'history';

const waitingForWeb3 = defineMessage({
  defaultMessage: "Connecting to your Web3 provider",
  description: "Message to display while waiting for user to complete Web3 connection"
});

// An authorized route is one that requires the use of an unlocked account
export const AuthRoute = (routeProps: RouteProps) => {
  const account = AccountMap.useActive();

  // If no account, suggest adding one (?)
  // NOTE: this _looks_ like it violates the principals
  // of hooks, that every render returns equal numbers of hooks
  // but in practice the rule is not violated Because
  // the redirect means there will be no additional renders
  if (!account) {
    return <Redirect to='/addAccount' />
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

  return (
    <Route {...routeProps} />
  )
}

// Our routes are defined as simple objects.
// The key maps to the path, and the entry is what is rendered.
// The map is recursive, and supports basic Route props.
export type RouteEntry = React.ComponentType<RouteComponentProps<any>>|RouteProps|RouteMap;
export type RouteMap = {
  [path: string]: RouteEntry
}
type AuthSwitchProps = {
  auth?: RouteMap,
  open?: RouteMap,
  fallback?: React.ComponentType,
  path?: string,
  // Allow manually spec'ing the location.  This is required
  // for cross-fade transitions (we need to render both pages at once)
  location?: Location
};

const isRouteProps = (entry: RouteEntry) : entry is RouteProps => !!(entry as RouteProps).component;
const isComponent = (entry: RouteEntry) : entry is React.ComponentType<RouteComponentProps<any>> => !isRouteProps(entry) && !(typeof entry == 'object');

function mapEntries(root: string, mapping: Object|undefined, RouteComponent: ComponentType<RouteProps>) : JSX.Element[] {
  if (!mapping) return [];
  const entries = Object.entries(mapping).map(([key, entry]) => {
    if (isRouteProps(entry)) return <RouteComponent key={key} path={`${root}/${key}`} {...entry} />
    else if (isComponent(entry)) return <RouteComponent key={key} path={`${root}/${key}`} component={entry} />
    else return mapEntries(`${root}/${key}`, entry, RouteComponent);
  })
  .reduce((acc: JSX.Element[], entry) => acc.concat(entry), []);
  return entries;
}

export const AuthSwitch = ({ path, location, auth, open, fallback }: AuthSwitchProps) => {
  const trimmed = path?.endsWith('/') ? path.slice(0, -1) : path ?? '';
  return (
    <Switch location={location} >
      {mapEntries(trimmed, open, Route)}
      {mapEntries(trimmed, auth, AuthRoute)}
      {fallback ? <Route component={fallback} /> : null}
    </Switch>
  )
}

