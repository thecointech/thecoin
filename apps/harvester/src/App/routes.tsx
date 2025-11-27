import { Home } from '../home';
import { Browser } from '../GetStarted';
import { Account, path as accountPath } from '../account';
import { Training, routes as trainingRoutes } from '../Training';
import { HarvestConfig, path as harvestConfigPath } from '../HarvestConfig';
import { Results } from '../results';
import { BankConnect, path as bankConnectPath } from '../Agent';
import { Advanced } from '../Advanced';
import { App } from '.';
import type { RouteObject } from 'react-router';
import type { Routes } from '@/SimplePath/types';

export const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'browser', element: <Browser /> },
      {
        path: 'account',
        children: toReactRouterRoutes(accountPath.routes),
        element: <Account />
      },
      {
        path: 'agent',
        children: toReactRouterRoutes(bankConnectPath.routes),
        element: <BankConnect /> },
      {
        path: 'config',
        children: toReactRouterRoutes(harvestConfigPath.routes),
        element: <HarvestConfig /> },
      { path: 'results', element: <Results /> },
      { path: 'advanced', element: <Advanced /> },
      {
        path: 'train',
        children: trainingRoutes,
        element: <Training /> },

    ]
  }
] as const satisfies RouteObject[];

function toReactRouterRoutes(path: Routes[]): RouteObject[] {
  const r = path.map((route) => ({
    path: route.path,
    element: <route.component />,
  } as RouteObject))
  // We always need an index somewhere
  const first = path[0];
  r.push({
    index: true,
    element: <first.component />,
  } as RouteObject)
  return r;
}

// export const Routes = () => (
//   <Switch>
//     <Route exact path='/' component={Home} />
//     <Route path='/browser' component={Browser} />
//     <Route path='/account' component={Account} />
//     <Route path='/agent' component={BankConnect} />
//     <Route path='/train' component={Training} />
//     <Route path='/config' component={HarvestConfig} />
//     <Route path='/results' component={Results} />
//     <Route path='/advanced' component={Advanced} />
//   </Switch>
// )
