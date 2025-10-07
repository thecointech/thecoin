import { Route, Switch } from "react-router-dom"
import { Path } from "./types"

// Overload: when data is provided
function PathRouter<T>(props: { path: Path<T>, data: T }): JSX.Element;
// Overload: when data is NOT provided (components accept no props)
function PathRouter(props: { path: Path<{}> }): JSX.Element;
// Implementation
function PathRouter<T>({path, data}: { path: Path<T>, data?: T }): JSX.Element {
  const componentProps = (data ?? {}) as any;
  
  return (
    <Switch>
      {
        path.routes.map((r, i) => {
          const Component = r.component;
          return (
            <Route
              key={i}
              path={`/${path.groupKey}/${i}`}
              exact
              render={() => <Component {...componentProps} />}
            />
          );
        })
      }
      <Route key="default" render={() => {
        const Component = path.routes[0].component;
        return <Component {...componentProps} />;
      }} />
    </Switch>
  )
}

export { PathRouter }
