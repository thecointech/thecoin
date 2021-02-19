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
import {Footer} from 'components/Footer';
import MainPageTransition from '@the-coin/site-base/components/MainPageTransition';
import { MainRouter } from 'containers/MainRouter';
import { usePrismic } from 'components/Prismic/reducer';
import { MediaContextProvider, mediaStyles } from '@the-coin/shared/components/ResponsiveTool';

// Either import CSS or LESS;
// - LESS is slower, but offers on-save hot-reload
// - CSS is faster, but requires manual recompile
import '@the-coin/site-semantic-theme/semantic.css';
//import '@the-coin/site-semantic-theme/semantic.less';
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
          <MainPageTransition location={location}>
            <section id={styles.mainContent} className={styles.pageMainInner}>
              <MainRouter />
            </section>
          </MainPageTransition>
        </Container>
        <Footer />
      </MediaContextProvider>
    </div>
  );
}
