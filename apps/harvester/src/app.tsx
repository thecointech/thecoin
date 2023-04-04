import 'semantic-ui-css/semantic.min.css'
import { Header } from 'semantic-ui-react'
import { Link, useLocation } from 'react-router-dom'
import { Routes } from './app.routes'


export const App = () => {
  const location = useLocation();
  return (
    <div>
      <Header>Semantic UI Is Loaded</Header>
      {location.pathname}
      <div>
        <Link to="./train">Training</Link><br />
        <Link to="./account">Account</Link><br />
      </div>
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
