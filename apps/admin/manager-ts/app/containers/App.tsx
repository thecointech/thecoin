import * as React from 'react';
import { PageSidebar } from './PageSidebar';
import { hot } from 'react-hot-loader/root'
import { Routes } from './Routes';


class App extends React.Component {

  render() {
    return (
      <React.Fragment>
        <PageSidebar visible={true}>
          <Routes />
        </PageSidebar>
      </React.Fragment>
    );
  }
}

const HotApp = hot(App);
export { HotApp as App }