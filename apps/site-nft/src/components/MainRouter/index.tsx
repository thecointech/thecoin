import * as React from 'react';
import { AddAccount } from '@thecointech/site-base/containers/AddAccount';
import { Congratulations } from '@thecointech/site-base/containers/AddAccount/Congratulations';
import { GAuth } from '@thecointech/site-base/containers/AddAccount/Storage/GDrive/gauth';
import { AuthRouter } from '@thecointech/shared/containers/AuthRoute';
import { Claim } from '../Claim';
import { ProfileBuilder } from '../ProfileBuilder';
import { HomePage } from '../HomePage';
import { Validate } from '../Validate';
import { Offsets } from '../Offsets';

//
// Trialing a more well-defined routing system
// This struct is exported so the keys (paths)
// can be referenced elsewhere in the project.
export const SiteMap = {
  auth: {
    claim: Claim,
    profile: ProfileBuilder,
  },
  open: {
    gauth: GAuth,
    addAccount: AddAccount,
    validate: Validate,
    offsets: Offsets,
    congrats: Congratulations,
  },
  default: HomePage,
}
export const MainRouter = () => <AuthRouter {...SiteMap} />
