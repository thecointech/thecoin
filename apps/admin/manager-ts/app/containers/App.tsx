import * as React from 'react';
import { hot } from 'react-hot-loader/root'
import { Routes } from './Routes';
import { Container } from 'semantic-ui-react';
import { PageSidebar } from '@the-coin/components/containers/PageSidebar';
import { FxRates } from '@the-coin/components/containers/FxRate'
import { injectRootReducer } from '@the-coin/components/containers/Account/reducer'

class App extends React.PureComponent {

  render() {
    return (
      <React.Fragment>
        <PageSidebar visible={true} inverted>
          <Container>
            <Routes />
          </Container>
        </PageSidebar>
        <FxRates />
      </React.Fragment>
    );
  }
}

const HotApp = injectRootReducer<{}>()(hot(App));
export { HotApp as App }