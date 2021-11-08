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
import {MainNavigation} from 'containers/MainNavigation';
import { Footer } from 'components/Footer';
import { MainPageTransition } from '@thecointech/site-base/components/MainPageTransition';
import { FxRateReducer } from '@thecointech/shared/containers/FxRate/reducer';
import { GreaterThanMobileSegment, MediaContextProvider, mediaStyles } from '@thecointech/shared/components/ResponsiveTool';
import { createRef } from 'react';
import { init } from './init'
import { Routes } from './Routes';

// Either import CSS or LESS;
// - LESS is slower, but offers on-save hot-reload
// - CSS is faster, but requires manual recompile
import '../../semantic/semantic.css';
//import '@thecointech/site-semantic-theme/semantic.less';
import styles from './styles.module.less';

init();

export const App = () => {
  FxRateReducer.useStore();
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
                  SIDEBAR
                </Sticky>
              </Rail>
            </GreaterThanMobileSegment>

            <Ref innerRef={contextRef}>
              <section id={styles.mainContent} className={styles.pageMainInner}>
                <Routes />
              </section>
            </Ref>
          </MainPageTransition>
        </Container>
      </div>
      <Footer />
    </MediaContextProvider>
  );
}
