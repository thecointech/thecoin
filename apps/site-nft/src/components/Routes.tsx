import * as React from 'react';
import { AddAccount } from '@thecointech/site-base/containers/AddAccount';
import { Congratulations } from '@thecointech/site-base/containers/AddAccount/Congratulations';
import { GAuth } from '@thecointech/site-base/containers/AddAccount/Storage/GDrive/gauth';
import { AuthSwitch } from '@thecointech/shared/containers/AuthRoute';
import { Claim } from './Claim';
import { ProfileBuilder } from './ProfileBuilder';
import { HomePage } from './HomePage';
import { Validate } from './Validate';
import { Offsets } from './Offsets';

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
  fallback: HomePage,
}
export const Routes = () => <AuthSwitch path='/' {...SiteMap} />
