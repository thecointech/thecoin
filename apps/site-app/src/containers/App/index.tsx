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
import {MainNavigation} from 'containers/MainNavigation';
import { Footer } from 'components/Footer';
import { PageSidebar } from '@thecointech/shared/containers/PageSidebar';
import { MainPageTransition } from '@thecointech/site-base/components/MainPageTransition';
import { MainRouter } from 'containers/MainRouter';
import { useFxRatesStore } from '@thecointech/shared/containers/FxRate/reducer';
import { useSidebar } from '@thecointech/shared/containers/PageSidebar/reducer';
import { GreaterThanMobileSegment, MediaContextProvider, mediaStyles } from '@thecointech/shared/components/ResponsiveTool';
import { createRef } from 'react';

// Either import CSS or LESS;
// - LESS is slower, but offers on-save hot-reload
// - CSS is faster, but requires manual recompile
import '../../semantic/semantic.css';
//import '@thecointech/site-semantic-theme/semantic.less';
import styles from './styles.module.less';

export const App = () => {
  useFxRatesStore();
  useSidebar();
  const location = useLocation();
  const contextRef = createRef<HTMLDivElement>();

  return (
    <MediaContextProvider>
      <style>{mediaStyles}</style>
      <div id={styles.headerDecoration}>
        <MainNavigation />
      </div>

      <div className={`${styles.contentContainer}`}>
        <Container style={{ width: '100%' }} className={``}>
          <MainPageTransition>

            <GreaterThanMobileSegment>
              <Rail internal position='left'>
                <Sticky context={contextRef}>
                  <PageSidebar />
                </Sticky>
              </Rail>
            </GreaterThanMobileSegment>


            <Ref innerRef={contextRef}>
              <section id={styles.mainContent} className={styles.pageMainInner}>
                <MainRouter location={location} />
              </section>
            </Ref>
          </MainPageTransition>
        </Container>
      </div>
      <Footer />
    </MediaContextProvider>
  );
}
