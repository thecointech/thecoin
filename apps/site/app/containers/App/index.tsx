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
import { useLocation } from 'react-router';

import Header from 'components/Header';
import MainNavigation from 'containers/MainNavigation';
import Footer from 'components/Footer';
import { PageSidebar } from '@the-coin/shared/containers/PageSidebar';
import { FxRates } from '@the-coin/shared/containers/FxRate';
import MainPageTransition from 'containers/MainPageTransition';
import MainRouter from 'containers/MainRouter';

import 'semantic-ui-less/semantic.less';

import styles from './index.module.css';
import { injectRootReducer } from '@the-coin/shared/containers/Account/reducer';

const AppClass = () => {
  const location = useLocation()
  const sidebarVisible = location.pathname.startsWith('/accounts');

  return (
    <>
      <Header />
      <MainNavigation />

      <Container
        style={{
          backgroundColor: '#fffff f',
          width: '100%',
          'max-width': '1600px',
        }}
      >
        <PageSidebar visible={sidebarVisible}>
          <MainPageTransition location={location}>
            <section className={styles.pageMainInner}>
              <MainRouter location={location} />
            </section>
          </MainPageTransition>
        </PageSidebar>
      </Container>
      <Footer />

      <FxRates />
    </>
  );
}

export const App = injectRootReducer<{}>()(AppClass);
