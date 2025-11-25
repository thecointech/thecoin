import * as React from 'react';

import { Routes as RRoutes, Route } from 'react-router';
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

export const Routes = () =>
  <RRoutes>
    <Route path="/" element={HomePage} />
    <Route path="/learn" element={Learn} />
    <Route path="/healthier" element={Healthier} />
    <Route path="/wedomore" element={WeDoMore} />
    <Route path="/compare" element={Compare} />
    <Route path="/help" element={HelpDocs} />
    <Route path="/blog" element={Blog} />
    <Route path="/faq/:category?" element={HelpDocs} />
    <Route path="/tos" element={TOS} />
    <Route path="/applyBeta" element={ApplyBeta} />
    <Route path="/privacy" element={Privacy} />
    <Route element={NotFoundPage} />
  </RRoutes>

