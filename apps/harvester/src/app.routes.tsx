import { NotFoundPage } from '@thecointech/shared/containers/NotFoundPage';
import { Account } from './account';
import { TrainRouter } from './Training/routes';
import { Route, Switch } from 'react-router-dom';

// export const AppRoutes = {
//   open: {
//     account: AccountRouter,
//     train: TrainRouter,
//   },
//   fallback: NotFoundPage
// }

export const Routes = () => (
  <Switch>
    <Route path='/account' component={Account} />
    <Route path='/train' component={TrainRouter} />
    {/* <Route path={`${url}/generate/intro`} component={Intro} />
    <Route path={`${url}/generate`} component={Generate} />
    <Route path={`${url}/connect/exist`} component={ConnectExist} />
    <Route path={`${url}/connect/create`} component={ConnectCreate} />
    <Route path={`${url}/restore/list`} component={RestoreList} />
    <Route path={`${url}/restore`} component={Restore} />
    <Route path={`${url}/store`} component={Store} /> */}
    {/* <Route render={() => <CreateExistingSwitch url={`${url}/`} />} /> */}
  </Switch>
)
  // <AuthSwitch path="/" {...AppRoutes} />
