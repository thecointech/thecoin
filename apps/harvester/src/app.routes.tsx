import { Home } from './home';
import { Browser } from './Download';
import { Account } from './account';
import { Training } from './Training';
import { Route, Switch } from 'react-router-dom';
import { HarvestConfig } from './HarvestConfig';
import { Results } from './results';
import { AgentPage } from './Agent/AgentPage';
import { RefreshTwoFA } from './Agent/RefreshTwoFA';
import { Advanced } from './Advanced';

export const Routes = () => (
  <Switch>
    <Route exact path='/' component={Home} />
    <Route path='/browser' component={Browser} />
    <Route path='/account' component={Account} />
    <Route path='/agent' component={AgentPage} />
    <Route path='/twofaRefresh' component={RefreshTwoFA} />
    <Route path='/train' component={Training} />
    <Route path='/config' component={HarvestConfig} />
    <Route path='/results' component={Results} />
    <Route path='/advanced' component={Advanced} />
  </Switch>
)
