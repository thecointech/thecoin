import 'semantic-ui-css/semantic.min.css'
import { Header } from 'semantic-ui-react'
import { Link, useLocation } from 'react-router-dom'
import { Routes } from './app.routes'
import { FxRateReducer } from '@thecointech/shared/containers/FxRate';

export const App = () => {
  FxRateReducer.useStore();
  const location = useLocation();
  return (
    <div>
      <Header>Semantic UI Is Loaded</Header>
      <div>
        <Link to="./train">Training</Link><br />
        <Link to="./account">Account</Link><br />
      </div>
      {location.pathname}
      <div>
        <Routes />
      </div>
    </div>
  )
}

// export const appRoutes: RouteObject[] = [
//   {
//     path: "/",
//     element: <App />,
//     children: [
//       {
//         index: true,
//         element: (
//         <div>
//           <Link to="./train">Training</Link><br />
//           <Link to="./account">Account</Link><br />
//         </div>
//         )
//       },
//       ...trainingRoutes,
//       ...accountRoutes,
//     ]
//   },
// ]
