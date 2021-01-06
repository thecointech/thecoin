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
import { Footer } from 'components/Footer';
import { PageSidebar } from '@the-coin/shared/containers/PageSidebar';
import MainPageTransition from '@the-coin/site-base/components/MainPageTransition';
import { MainRouter } from 'containers/MainRouter';
import { usePrismic } from 'components/Prismic/reducer';
import { MediaContextProvider, mediaStyles } from '@the-coin/site-base/components/ResponsiveTool';

// Our CSS version isn't building correctly yet, but once it does
// we can save a bit of compile time by referring to it directly
// instead of the LESS files
import '@the-coin/site-base/styles/semantic.css';
//import '@the-coin/site-base/styles/semantic.less';
import styles from './styles.module.less';

export const App = () => {
  usePrismic();
  const location = useLocation();

  return (
    <div id={styles.app}>
      <MediaContextProvider>
        <style>{mediaStyles}</style>
        <div id={styles.headerDecoration}>
          <MainNavigation />
        </div>

        <Container className={styles.appContainer}>
          <PageSidebar>
            <MainPageTransition location={location}>
              <section id={styles.mainContent} className={styles.pageMainInner}>
                <MainRouter />
              </section>
            </MainPageTransition>
          </PageSidebar>
        </Container>
        <Footer />
      </MediaContextProvider>
    </div>
  );
}
