import React from 'react';
import { Navigate, type RouteObject } from 'react-router';
import { AuthLayout } from '@thecointech/shared/containers/AuthLayout';
import { MakePayments } from '../MakePayments';
import { ContactUs } from '../ContactUs';
import { Settings } from '../Settings';
import { Topup } from '../TopUp';
import { HomePage } from '../HomePage';
import { HarvesterConnect } from '../Harvester/Connect';
import { App } from './index';
import { OpenRoutes } from './Routes.open';

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
      ...OpenRoutes,
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
