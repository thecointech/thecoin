import 'semantic-ui-css/semantic.min.css'
import { Header } from 'semantic-ui-react'
import { trainingRoutes } from './Training/Training'
import { Outlet, RouteObject, Link, useLocation } from 'react-router-dom'


export const App = () => {
  const location = useLocation();
  return (
    <div>
      <Header>Semantic UI Is Loaded</Header>
      {location.pathname}
      <Outlet />
    </div>
  )
}

export const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Link to="./train">Training</Link>
      },
      ...trainingRoutes,
    ]
  },
]
