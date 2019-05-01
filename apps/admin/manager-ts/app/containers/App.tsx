import * as React from 'react';
import { hot } from 'react-hot-loader/root'
import { Routes } from './Routes';
import { Container } from 'semantic-ui-react';
import { PageSidebar } from '@the-coin/components/containers/PageSidebar';
import { buildReducer } from '@the-coin/components/containers/FxRate/reducer'

class App extends React.PureComponent {

  render() {
    return (
      <React.Fragment>
        <PageSidebar visible={true} inverted>
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