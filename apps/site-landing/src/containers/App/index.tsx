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

import MainNavigation from 'containers/MainNavigation';
import Footer from 'components/Footer';
import { PageSidebar } from '@the-coin/shared/containers/PageSidebar';
import MainPageTransition from '@the-coin/site-base/components/MainPageTransition';
import {MainRouter} from 'containers/MainRouter';

import 'semantic-ui-less/semantic.less';

import { usePrismic } from 'components/Prismic/reducer';
import { useAccountMapStore } from '@the-coin/shared/containers/AccountMap';
import { useFxRatesStore } from '@the-coin/shared/containers/FxRate/reducer';
import styles from './styles.module.less';

import { MediaContextProvider, mediaStyles } from '@the-coin/site-base/components/ResponsiveTool';

export const App = ( ) => {
  usePrismic();
  useFxRatesStore();
  useAccountMapStore();
  const location = useLocation();

  return (
    <>
    <MediaContextProvider>
      <style>{mediaStyles}</style>
      <div id={styles.headerDecoration}>
        <MainNavigation />
      </div>

      <Container className="appContainer"
        style={{
          width: '100%'
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
    </MediaContextProvider>
    </>
  );
}
