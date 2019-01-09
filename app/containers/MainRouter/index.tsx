import * as React from 'react';
import { Location } from 'history';

import { Switch, Route } from 'react-router-dom';
import HomePage from 'containers/HomePage/index';
import NotFoundPage from 'containers/NotFoundPage';
import Accounts from 'containers/Accounts';

export default (props: { location: Location }) => (
  <Switch location={props.location}>
    <Route exact path="/" component={HomePage} />
    <Route path="/accounts" component={Accounts} />
    <Route component={NotFoundPage} />
  </Switch>
);
