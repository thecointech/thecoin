import React from 'react';
import { GAuth } from '@thecointech/site-base/containers/AddAccount/Storage/GDrive';
import { routes as AddAccountRoutes } from '@thecointech/site-base/containers/AddAccount';
import { Congratulations } from '@thecointech/site-base/containers/AddAccount/Congratulations';

export const OpenRoutes = [
  // Open routes at same level
  { path: 'gauth', element: <GAuth /> },
  { path: 'congratulations', element: <Congratulations /> },
  {
    path: 'addAccount',
    children: AddAccountRoutes,
  },
]

export const getOpenRoutes = () => {
  return OpenRoutes
    .map(r => r.path);
}
