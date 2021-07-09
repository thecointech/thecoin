import * as React from 'react';
import { Location } from 'history';
import { Switch, Route } from 'react-router-dom';
import { Accounts } from 'containers/Accounts';
import { AddAccount } from '@thecointech/site-base/containers/AddAccount';
import { Congratulations } from '@thecointech/site-base/containers/AddAccount/Congratulations';
import { GAuth } from '@thecointech/site-base/containers/AddAccount/Storage/GDrive/gauth';


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
