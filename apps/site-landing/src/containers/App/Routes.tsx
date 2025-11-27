import React from 'react';
import type { RouteObject } from 'react-router';
import { HomePage } from 'containers/HomePage/index';
import { NotFoundPage } from '@thecointech/shared/containers/NotFoundPage';
import { Healthier } from 'containers/Healthier';
import { WeDoMore } from 'containers/WeDoMore';
import { Compare } from 'containers/BenefitsSimulator';
import { HelpDocs } from 'containers/HelpDocs';
import { blogRoutes } from 'containers/Blog';
import { TOS } from 'containers/TOS';
import { Privacy } from 'containers/Privacy';
import { ApplyBeta } from '../ApplyBeta';
import { App } from '.';
// import { Returns } from 'containers/ReturnProfile';

export const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'healthier', element: <Healthier /> },
      { path: 'wedomore', element: <WeDoMore /> },
      { path: 'compare', element: <Compare /> },
      { path: 'help', element: <HelpDocs /> },
      { path: 'blog', children: blogRoutes },
      { path: 'faq/:category?', element: <HelpDocs /> },
      { path: 'tos', element: <TOS /> },
      { path: 'applyBeta', element: <ApplyBeta /> },
      { path: 'privacy', element: <Privacy /> },
      //{ path: 'returns', element: <Returns /> },
      { path: '*', element: <NotFoundPage /> },
    ]
  }
] satisfies RouteObject[];
