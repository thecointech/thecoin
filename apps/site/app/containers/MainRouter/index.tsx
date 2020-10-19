import * as React from 'react';
import { Location } from 'history';

import { Switch, Route } from 'react-router-dom';
import { HomePage } from 'containers/HomePage/index';
import { NotFoundPage } from '@the-coin/shared/containers/NotFoundPage';
import { Accounts } from 'containers/Accounts';
import { AddAccount } from 'containers/AddAccount';
import { Healthier } from 'containers/Healthier';
import { WeDoMore } from 'containers/WeDoMore';
import { Confirm } from 'containers/Subscribe/Confirm';
import { GAuth } from 'containers/StoreOnline/Google/gauth';
import { Learn } from 'containers/Learn';
import { HelpDocs } from 'containers/HelpDocs';

export const MainRouter = (props: { location: Location }) => {
  return (
    <Switch location={props.location}>
      <Route path="/accounts/gauth" component={GAuth} />
      <Route path="/" exact component={HomePage} />
      <Route path="/newsletter/confirm" exact  component={Confirm} />
      <Route path="/addAccount" component={AddAccount} />
      <Route path="/accounts" component={Accounts} />
      <Route path="/learn" component={Learn} />
      <Route path="/healthier" component={Healthier} />
      <Route path="/wedomore" component={WeDoMore} />
      <Route path="/FAQ" component={HelpDocs} />
      <Route component={NotFoundPage} />
    </Switch>
  )
}