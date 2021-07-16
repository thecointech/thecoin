import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { AddAccount } from '@thecointech/site-base/containers/AddAccount';
import { Congratulations } from '@thecointech/site-base/containers/AddAccount/Congratulations';
import { GAuth } from '@thecointech/site-base/containers/AddAccount/Storage/GDrive/gauth';
import { Claim } from '../Claim';
import { AuthRoute } from '../AuthRoute';
import { ProfileBuilder } from '../ProfileBuilder';
import { HomePage } from '../HomePage';
import { Validate } from '../Validate';
import { Offsets } from '../Offsets';

//
// Trialing a more well-defined routing system
// This struct is exported so the keys (paths)
// can be referenced elsewhere in the project.
export const SiteMap = {
  Auth: {
    claim: Claim,
    profile: ProfileBuilder,
  },
  Public: {
    gauth: GAuth,
    addAccount: AddAccount,
    validate: Validate,
    offsets: Offsets,
    congrats: Congratulations,
  },
  default: HomePage,
}

export const MainRouter = () => {
  return (
    <Switch>
      {Object.entries(SiteMap.Auth).map(([key, component]) => <AuthRoute key={key} path={`/${key}`} component={component} />)}
      {Object.entries(SiteMap.Public).map(([key, component]) => <Route key={key} path={`/${key}`} component={component} />)}
      <Route path="/" component={SiteMap.default} />
    </Switch>
  )
}
