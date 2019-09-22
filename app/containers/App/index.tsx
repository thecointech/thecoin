/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import * as React from 'react';
import { Container } from 'semantic-ui-react';
import { connect } from 'react-redux';

import Header from 'components/Header';
import MainNavigation from 'containers/MainNavigation';
import Footer from 'components/Footer';
import { PageSidebar } from '@the-coin/components/containers/PageSidebar';
import MainPageTransition from 'containers/MainPageTransition';
import MainRouter from 'containers/MainRouter';
import { LocationStoreState, mapLocationStateToProps } from 'containers/Location/selectors';
import 'semantic-ui-less/semantic.less';

import styles from './index.module.css';

function App(props: LocationStoreState) {
  const sidebarVisible = props.location.pathname.startsWith('/accounts');

  return (
    <React.Fragment>
      <Header />
      <MainNavigation />
      <Container style={{ backgroundColor: '#f3f3f3' }}>
        <PageSidebar visible={sidebarVisible}>
          <MainPageTransition location={props.location}>
            <section className={styles.pageMainInner}>
              <MainRouter location={props.location} />
            </section>
          </MainPageTransition>
        </PageSidebar>
      </Container>
      <Footer />
    </React.Fragment>
  );
}

export default connect(mapLocationStateToProps)(App);