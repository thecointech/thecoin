import * as React from 'react';
import { Location } from 'history';

import { Switch, Route } from 'react-router-dom';
import { NotFoundPage } from '@the-coin/shared/containers/NotFoundPage';
import { Accounts } from 'containers/Accounts';
import { AddAccount } from 'containers/AddAccount';
import { Congratulations } from 'containers/AddAccount/Congratulations';
import { GAuth } from 'containers/StoreOnline/Google/gauth';

export const MainRouter = (props: { location: Location }) => {
  return (
    <Switch location={props.location}>
      <Route path="/gauth" component={GAuth} />
      <Route path="/" exact component={Accounts} />
      <Route path="/addAccount" component={AddAccount} />
      <Route path="/accounts" component={Accounts} />
      <Route path="/congratulations" component={Congratulations} />
      <Route component={NotFoundPage} />
    </Switch>
  )
}
