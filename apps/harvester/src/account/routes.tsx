import { AccountState } from '@thecointech/account';
import { Redirect, Route, Switch } from 'react-router';
import { Login } from './Login';
import { Plugins } from './Plugins';
import { Upload } from './Upload';

export const AccountRouter = ({account}:{account?: AccountState}) => (
  <Switch>
    <Route path="/account/login" render={() => (
      account
        ? <Login account={account} />
        : <Redirect to="/account" />
    )} />
    <Route path="/account/plugins" component={Plugins} />
    <Route path="/account" component={Upload} />
  </Switch>
)
