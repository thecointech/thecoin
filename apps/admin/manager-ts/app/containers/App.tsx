import * as React from 'react';
import { Container } from 'semantic-ui-react';

import 'semantic-ui-css/semantic.min.css'
import { PageSidebar } from './PageSidebar';
import { hot } from 'react-hot-loader/root'

class App extends React.Component {
  render() {
    return <React.Fragment>
      <PageSidebar visible={true}>
        <Container>Licka Both Ma Balls!</Container>
      </PageSidebar>
    </React.Fragment>;
  }
}

const HotApp = hot(App);
export { HotApp as App }