import * as React from 'react';
import { Location } from 'history';

import { Switch, Route } from 'react-router-dom';
import {HomePage} from 'containers/HomePage/index';
import { NotFoundPage } from '@the-coin/shared/containers/NotFoundPage';
import { Accounts } from 'containers/Accounts';
import { AddAccount } from 'containers/AddAccount';
import { HowItWorks } from 'containers/HowItWorks';
import { Confirm } from 'containers/Subscribe/Confirm';
import { GAuth } from 'containers/Accounts/Settings/gconnect/gauth';
import { Learn } from 'containers/Learn';
import { HelpDocs } from 'containers/HelpDocs';

export default (props: { location: Location }) => (
  (window.location.pathname === '/accounts/gauth') ?
    <GAuth /> : (
    <Switch location={props.location}>
      <Route exact path="/" component={HomePage} />
      <Route exact path="/newsletter/confirm" component={Confirm} />
      <Route path="/addAccount" component={AddAccount} />
      <Route path="/accounts" component={Accounts} />
      <Route path="/learn" component={Learn} />
      <Route path="/howItWorks" component={HowItWorks} />
      <Route path="/FAQ" component={HelpDocs} />
      <Route component={NotFoundPage} />
    </Switch>
    )
);
