import * as React from 'react';

import { Switch, Route, RouteComponentProps } from 'react-router-dom';
import { View } from 'containers/ReturnProfile';
//import { HowItWorks } from 'containers/HowItWorks';

type Props = RouteComponentProps;

export const Learn: React.FunctionComponent<Props> = (props: Props) => {
  //const { match } = props;
  //const { url } = match;

  return (
      <>
        <View />
      </>
  );
};
