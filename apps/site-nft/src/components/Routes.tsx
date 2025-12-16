import React from 'react';
import { type RouteObject } from 'react-router';
import { routes as AddAccountRoutes } from '@thecointech/site-base/containers/AddAccount';
import { Congratulations } from '@thecointech/site-base/containers/AddAccount/Congratulations';
import { GAuth } from '@thecointech/site-base/containers/AddAccount/Storage/GDrive/gauth';
import { AuthLayout } from '@thecointech/shared/containers/AuthRoute';
import { Claim } from './Claim';
import { ProfileBuilder } from './ProfileBuilder';
import { HomePage } from './HomePage';
import { Validate } from './Validate';
import { Offsets } from './Offsets';
import { App } from './App';

export const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        // Authenticated routes
        element: <AuthLayout />,
        children: [
          { path: 'claim', element: <Claim /> },
          { path: 'profile', element: <ProfileBuilder /> },
        ]
      },
      // Open routes at same level
      { path: 'gauth', element: <GAuth /> },
      { path: 'validate', element: <Validate /> },
      { path: 'offsets', element: <Offsets /> },
      { path: 'congrats', element: <Congratulations /> },
      {
        path: 'addAccount',
        children: AddAccountRoutes,
      },
    ]
  },
  {
    path: '*',
    element: <HomePage />
  }
] as const satisfies RouteObject[];
