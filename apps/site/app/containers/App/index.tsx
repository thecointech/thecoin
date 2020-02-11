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
import { useFxRatesStore } from '@the-coin/shared/containers/FxRate/reducer';
import MainPageTransition from 'containers/MainPageTransition';
import {MainRouter} from 'containers/MainRouter';

import 'semantic-ui-less/semantic.less';

import { usePrismic } from 'containers/Prismic/reducer';
import { useAccountMapStore } from '@the-coin/shared/containers/AccountMap';
import styles from './index.module.css';

export const App = () => {
  usePrismic();
  useFxRatesStore();
  useAccountMapStore();
  const location = useLocation();

  return (
    <>
      <Header />
      <MainNavigation />

      <Container
        style={{
          backgroundColor: '#fffff f',
          width: '100%',
        }}
      >
        <PageSidebar>
          <MainPageTransition location={location}>
            <section id={styles.mainContent} className={styles.pageMainInner}>
              <MainRouter location={location} />
            </section>
          </MainPageTransition>
        </PageSidebar>
      </Container>
      <Footer />
    </>
  );
}
