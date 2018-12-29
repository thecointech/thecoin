import * as React from 'react';
import { Location } from 'history';

import { Switch, Route } from 'react-router-dom';
import HomePage from 'containers/HomePage/index';
import NotFoundPage from 'containers/NotFoundPage/index';

export default (props: { location: Location }) => (
  <Switch location={props.location}>
    <Route exact path="/" component={HomePage} />
    <Route component={NotFoundPage} />
  </Switch>
);
