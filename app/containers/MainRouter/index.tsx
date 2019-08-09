import * as React from 'react';
import { Location } from 'history';

import { Switch, Route } from 'react-router-dom';
import HomePage from 'containers/HomePage/index';
import { NotFoundPage } from '@the-coin/components/containers/NotFoundPage';
import { Accounts } from 'containers/Accounts';
import { HowItWorks } from 'containers/HowItWorks';
import { UnderConstruction } from 'containers/UnderConstruction';
import { GAuth } from 'containers/Accounts/Settings/gconnect/gauth';

export default (props: { location: Location }) => (
  (window.location.pathname === '/accounts/gauth') ?
    <GAuth /> : (
    <Switch location={props.location}>
      <Route exact path="/" component={HomePage} />
      <Route path="/accounts" component={Accounts} />
      <Route path="/howItWorks" component={HowItWorks} />
      <Route path="/FAQ" component={UnderConstruction} />
      <Route component={NotFoundPage} />
    </Switch>
    )
);
