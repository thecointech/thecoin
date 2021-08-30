import * as React from 'react';
import { Location } from 'history';
import { Switch, Route } from 'react-router-dom';
import { Accounts } from 'containers/Accounts';
import { AddAccount } from 'containers/AddAccount';
import { Congratulations } from 'containers/AddAccount/Congratulations';
import { GAuth } from 'containers/StoreOnline/Google/gauth';


export const MainRouter = (props: { location: Location }) => {
  return (
    <Switch location={props.location}>
      <Route path="/gauth" component={GAuth} />
      <Route path="/addAccount" component={AddAccount} />
      <Route path="/congratulations" component={Congratulations} />
      <Route path="/" component={Accounts} />
    </Switch>
  )
}