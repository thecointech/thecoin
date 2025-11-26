import React from 'react';
import type { RouteObject } from 'react-router';
import { HomePage } from 'containers/HomePage/index';
import { NotFoundPage } from '@thecointech/shared/containers/NotFoundPage';
import { Healthier } from 'containers/Healthier';
import { WeDoMore } from 'containers/WeDoMore';
import { Compare } from 'containers/BenefitsSimulator';
import { Learn } from 'containers/Learn';
import { HelpDocs } from 'containers/HelpDocs';
import { Blog } from 'containers/Blog';
import { TOS } from 'containers/TOS';
import { Privacy } from 'containers/Privacy';
import { ApplyBeta } from '../ApplyBeta';
import { App } from '.';

export const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'learn/*', element: <Learn /> },
      { path: 'healthier', element: <Healthier /> },
      { path: 'wedomore', element: <WeDoMore /> },
      { path: 'compare', element: <Compare /> },
      { path: 'help', element: <HelpDocs /> },
      { path: 'blog/*', element: <Blog /> },
      { path: 'faq/:category?', element: <HelpDocs /> },
      { path: 'tos', element: <TOS /> },
      { path: 'applyBeta', element: <ApplyBeta /> },
      { path: 'privacy', element: <Privacy /> },
      { path: '*', element: <NotFoundPage /> },
    ]
  }
] satisfies RouteObject[];
