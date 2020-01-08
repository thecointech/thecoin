import * as React from 'react';
import { hot } from 'react-hot-loader/root'
import { Routes } from './Routes';
import { Container } from 'semantic-ui-react';
import { PageSidebar } from '@the-coin/shared/containers/PageSidebar';
import { useAccounts } from '@the-coin/shared/containers/Account/reducer'
import { useFxRates } from '@the-coin/shared/containers/FxRate/reducer';

export const App = hot(() => {

  useFxRates();
  useAccounts();

  const divStyle = {
    minHeight: "500px"
  };

  return (
    <React.Fragment>
      <PageSidebar visible={true} inverted>
        <Container style={divStyle}>
          <Routes />
        </Container>
      </PageSidebar>
    </React.Fragment>
  );
})