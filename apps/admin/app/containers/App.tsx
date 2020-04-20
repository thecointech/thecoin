import * as React from 'react';
import { hot } from 'react-hot-loader/root'
import { Routes } from './Routes';
import { Container } from 'semantic-ui-react';
import { PageSidebar, AccountMap, FxRate } from '@the-coin/shared';

export const App = hot(() => {

  FxRate.useFxRatesStore();
  AccountMap.useAccountMapStore();

  const divStyle = {
    minHeight: "500px"
  };

  return (
    <React.Fragment>
      <PageSidebar.PageSidebar visible={true} inverted>
        <Container style={divStyle}>
          <Routes />
        </Container>
      </PageSidebar.PageSidebar>
    </React.Fragment>
  );
})