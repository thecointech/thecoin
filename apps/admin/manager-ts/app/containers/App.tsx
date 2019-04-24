import * as React from 'react';
import { PageSidebar } from './PageSidebar';
import { hot } from 'react-hot-loader/root'
import { Routes } from './Routes';
import { Container } from 'semantic-ui-react';
import { buildReducer } from '@the-coin/react-components/lib/containers/FxRate/reducer'

class App extends React.Component {

  render() {
    return (
      <React.Fragment>
        <PageSidebar visible={true}>
          <Container>
            <Routes />
          </Container>
        </PageSidebar>
      </React.Fragment>
    );
  }
}

const HotApp = buildReducer<{}>()(hot(App));
export { HotApp as App }