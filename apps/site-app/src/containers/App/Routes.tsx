import React from 'react';
import { Navigate, type RouteObject } from 'react-router';
import { AuthLayout } from '@thecointech/shared/containers/AuthRoute';
import { GAuth } from '@thecointech/site-base/containers/AddAccount/Storage/GDrive/gauth';
import { AddAccount } from '@thecointech/site-base/containers/AddAccount';
import { Congratulations } from '@thecointech/site-base/containers/AddAccount/Congratulations';
import { MakePayments } from '../MakePayments';
import { ContactUs } from '../ContactUs';
import { Settings } from '../Settings';
import { Topup } from '../TopUp';
import { HomePage } from '../HomePage';
import { HarvesterConnect } from '../Harvester/Connect';
import { App } from './index';

export const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        // Authenticated routes
        element: <AuthLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'transferIn', element: <Topup /> },
          { path: 'makePayments', element: <MakePayments /> },
          { path: 'settings', element: <Settings /> },
          { path: 'contact', element: <ContactUs /> },
          { path: 'harvester/connect', element: <HarvesterConnect /> },
        ]
      },
      // Open routes at same level
      { path: 'gauth', element: <GAuth /> },
      { path: 'addAccount', element: <AddAccount /> },
      { path: 'congratulations', element: <Congratulations /> },
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" />
  }
] as const satisfies RouteObject[];

// export const AppRoutes = {
//   auth: {
//     home: HomePage,
//     transferIn: Topup,
//     makePayments: MakePayments,
//     settings: Settings,
//     contact: ContactUs,
//     'harvester/connect': HarvesterConnect,
//   },
//   open: {
//     gauth: GAuth,
//     addAccount: AddAccount,
//     congratulations: Congratulations,
//   },
//   fallback: () => <AuthRoute component={HomePage} />
// }

// export const Routes = () => <AuthSwitch path="/" {...AppRoutes} />
