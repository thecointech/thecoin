import { Home } from './home';
import { Browser } from './Browser';
import { Account } from './account';
import { Training } from './Training';
import { Route, Switch } from 'react-router-dom';
import { HarvestConfig } from './HarvestConfig';
import { Results } from './results';

export const Routes = () => (
  <Switch>
    <Route exact path='/' component={Home} />
    <Route path='/browser' component={Browser} />
    <Route path='/account' component={Account} />
    <Route path='/train' component={Training} />
    <Route path='/config' component={HarvestConfig} />
    <Route path='/results' component={Results} />
  </Switch>
)
