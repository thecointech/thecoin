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
import { PageSidebar } from '@the-coin/shared/containers/PageSidebar';
import MainPageTransition from '@the-coin/site-base/components/MainPageTransition';
import {MainRouter} from 'containers/MainRouter';
import { useAccountMapStore } from '@the-coin/shared/containers/AccountMap';
import { useFxRatesStore } from '@the-coin/shared/containers/FxRate/reducer';
import { MediaContextProvider, mediaStyles } from '@the-coin/shared/components/ResponsiveTool';

// Either import CSS or LESS;
// - LESS is slower, but offers on-save hot-reload
// - CSS is faster, but requires manual recompile
import '../../semantic/semantic.css';
//import '@the-coin/site-semantic-theme/semantic.less';

import styles from './styles.module.less';
import { ColumnRightTop } from 'containers/ColumnRight/Top';
import { ColumnRightBottom } from 'containers/ColumnRight/Bottom';


export const App = ( ) => {
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

      <Container
        style={{
          width: '100%',
        }}
      >
          <MainPageTransition location={location}>
          <PageSidebar/>
          <ColumnRightTop />
            <section id={styles.mainContent} className={styles.pageMainInner}>
              <MainRouter location={location} />
            </section>
          <ColumnRightBottom />
          </MainPageTransition>
      </Container>
      <Footer />
    </MediaContextProvider>
    </>
  );
}
