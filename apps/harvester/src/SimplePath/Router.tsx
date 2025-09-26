import { Route, Switch } from "react-router"
import { DefaultPathProps } from "./types"

export const PathRouter = ({path}: DefaultPathProps) => {
  return (
    <Switch>
      {
        path.routes.map((r, i) => (
          <Route
            key={i}
            path={`/${path.groupKey}/${i}`}
            exact
            component={r.component}
          />
        ))
      }
      <Route key= "default" component={path.routes[0].component} />
    </Switch>
  )
}
