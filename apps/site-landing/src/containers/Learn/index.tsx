import * as React from 'react';

import { Switch, Route, RouteComponentProps } from 'react-router-dom';
import { Returns } from 'containers/ReturnProfile';
import { Healthier } from 'containers/Healthier';

type Props = RouteComponentProps;

export const Learn: React.FunctionComponent<Props> = (props: Props) => {
  const { match } = props;
  const { url } = match;

  return (
    <Switch location={props.location}>
      <Route path={`${url}/calculator`} component={Returns} />
      <Route component={Healthier} />
    </Switch>
  );
};
