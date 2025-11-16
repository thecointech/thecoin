import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { HomePage } from './containers/HomePage';
import { TestViewerPage } from './containers/TestViewerPage';

export const Routes = () =>
  <Switch>
    <Route path="/" exact component={HomePage} />
    <Route path="/test/:key/:element" component={TestViewerPage} />
  </Switch>
