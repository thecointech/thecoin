import * as React from 'react';

import { Switch, Route } from 'react-router-dom';
import { HomePage } from 'containers/HomePage/index';
import { NotFoundPage } from '@thecointech/shared/containers/NotFoundPage';
import { Healthier } from 'containers/Healthier';
import { WeDoMore } from 'containers/WeDoMore';
import { Compare } from 'containers/Compare';
import { Confirm } from 'containers/Subscribe/Confirm';
import { Learn } from 'containers/Learn';
import { HelpDocs } from 'containers/HelpDocs';
import { Blog } from 'containers/Blog';
import { TOS } from 'containers/TOS';
import { Privacy } from 'containers/Privacy';

export const Routes = () =>
  <Switch>
    <Route path="/" exact component={HomePage} />
    <Route path="/newsletter/confirm" exact component={Confirm} />
    <Route path="/learn" component={Learn} />
    <Route path="/healthier" component={Healthier} />
    <Route path="/wedomore" component={WeDoMore} />
    <Route path="/compare" component={Compare} />
    <Route path="/blog" component={Blog} />
    <Route path="/faq/:category?" component={HelpDocs} />
    <Route path="/tos" component={TOS} />
    <Route path="/privacy" component={Privacy} />
    <Route component={NotFoundPage} />
  </Switch>

