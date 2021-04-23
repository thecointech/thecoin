/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import * as React from 'react';
import { Container, Rail, Ref, Sticky } from 'semantic-ui-react';
import { useLocation } from 'react-router';
import { MainNavigation } from 'containers/MainNavigation';
import { Footer } from 'components/Footer';
import { PageSidebar } from '@thecointech/shared/containers/PageSidebar';
import MainPageTransition from '@thecointech/site-base/components/MainPageTransition';
import { MainRouter } from 'containers/MainRouter';
import { useFxRatesStore } from '@thecointech/shared/containers/FxRate/reducer';
import { useSidebar } from '@thecointech/shared/containers/PageSidebar/reducer';
import { MediaContextProvider, mediaStyles } from '@thecointech/shared/components/ResponsiveTool';

// Either import CSS or LESS;
// - LESS is slower, but offers on-save hot-reload
// - CSS is faster, but requires manual recompile
import '../../semantic/semantic.css';
//import '@thecointech/site-semantic-theme/semantic.less';

import styles from './styles.module.less';
import { ColumnRightTop } from 'containers/ColumnRight/Top';
import { ColumnRightBottom } from 'containers/ColumnRight/Bottom';
import { addDevAccounts, addDevLiveAccounts } from 'api/mock/accounts';
import { createRef } from 'react';
import { useAccountStoreApi } from '@thecointech/shared/containers/AccountMap';

let needsInit = true;
export const App = () => {
  useFxRatesStore();
  useSidebar();
  const location = useLocation();
  const contextRef = createRef<HTMLDivElement>()

  const accountsApi = useAccountStoreApi();
  if (needsInit) {
    needsInit = false;
    if (process.env.NODE_ENV === 'production') {
      accountsApi.initializeAccounts();
    }
    else {
      // In debug, initialize with default accounts
      addDevAccounts(accountsApi);
      if (process.env.SETTINGS === 'live') {
        addDevLiveAccounts(accountsApi);
      }
    }

  }

  return (
    <MediaContextProvider>
      <style>{mediaStyles}</style>
      <div id={styles.headerDecoration}>
        <MainNavigation />
      </div>

      <div className={`${styles.contentContainer}`}>
        <Container style={{ width: '100%' }} className={``}>
          <MainPageTransition location={location}>

            <Rail internal position='left'>
              <Sticky context={contextRef}>
                <PageSidebar />
              </Sticky>
            </Rail>

            <ColumnRightTop />

            <Ref innerRef={contextRef}>
              <section id={styles.mainContent} className={styles.pageMainInner}>
                <MainRouter location={location} />
              </section>
            </Ref>
            <ColumnRightBottom />
          </MainPageTransition>
        </Container>
      </div>
      <Footer />
    </MediaContextProvider>
  );
}
