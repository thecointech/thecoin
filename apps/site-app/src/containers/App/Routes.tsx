import * as React from 'react';
import { AuthRoute, AuthSwitch } from '@thecointech/shared/containers/AuthRoute';
import { MakePayments } from '../MakePayments';
import { ContactUs } from '../ContactUs';
import { Settings } from '../Settings';
import { Topup } from '../TopUp';
import { GAuth } from '@thecointech/site-base/containers/AddAccount/Storage/GDrive/gauth';
import { AddAccount } from '@thecointech/site-base/containers/AddAccount';
import { Congratulations } from '@thecointech/site-base/containers/AddAccount/Congratulations';
import { HomePage } from '../HomePage';
import { HarvesterConnect } from '../Harvester/Connect';

export const AppRoutes = {
  auth: {
    home: HomePage,
    transferIn: Topup,
    makePayments: MakePayments,
    settings: Settings,
    contact: ContactUs,
    'harvester/connect': HarvesterConnect,
  },
  open: {
    gauth: GAuth,
    addAccount: AddAccount,
    congratulations: Congratulations,
  },
  fallback: () => <AuthRoute component={HomePage} />
}

export const Routes = () => <AuthSwitch path="/" {...AppRoutes} />
