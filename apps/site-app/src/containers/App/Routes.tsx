import React from 'react';
import { Navigate, type RouteObject } from 'react-router';
import { AuthLayout } from '@thecointech/shared/containers/AuthLayout';
import { GAuth } from '@thecointech/site-base/containers/AddAccount/Storage/GDrive/gauth';
import { routes as AddAccountRoutes } from '@thecointech/site-base/containers/AddAccount';
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
      { path: 'congratulations', element: <Congratulations /> },
      {
        path: 'addAccount',
        children: AddAccountRoutes,
      },
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" />
  }
] as const satisfies RouteObject[];

type AuthenticatedRouteArray = typeof routes[0]['children'][0]['children'];
type ExtractPathKeys<T> = T extends (infer U)[] // Infer the array element type U
  ? U extends { path: infer P } // If U has a 'path' property, infer its type P
    ? P // If yes, return P (the path string)
    : never // If no (like for { index: true }), discard it
  : never;
export type AuthPathKey = ExtractPathKeys<AuthenticatedRouteArray>;

export const getOpenRoutes = () => {
  // All routes are under App
  const appRoutes = routes[0].children;
  // Authenticated routes are under AuthLayout
  // (which does not have a path)
  const openRoutes = Object.values(appRoutes)
    .filter(r => 'path' in r)
    .map(r => (r as { path: string }).path);
  return openRoutes;
}
