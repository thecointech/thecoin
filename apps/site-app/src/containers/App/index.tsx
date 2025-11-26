/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React, { useRef } from 'react';
import { Outlet } from 'react-router';
import { MainNavigation } from 'containers/MainNavigation';
import { Footer } from 'components/Footer';
import { MainPageTransition } from '@thecointech/site-base/components/MainPageTransition';
import { FxRateReducer } from '@thecointech/shared/containers/FxRate/reducer';
import { MediaContextProvider, mediaStyles } from '@thecointech/shared/components/ResponsiveTool';
import { useSidebar } from '../Sidebar';
import { init } from './init'
import { Sidebar } from '../Sidebar/Sidebar';

// Either import CSS or LESS;
// - LESS is slower, but offers on-save hot-reload
// - CSS is faster, but requires manual recompile
//import '../../semantic/semantic.css';
import '@thecointech/site-semantic-theme/semantic.less';
import styles from './styles.module.less';
import { WidgetWrapper, BalanceAndProfit, ClimateImpact } from '../Widgets'

await init();

export const App = () => {
  FxRateReducer.useStore();
  useSidebar()
  // const contextRef = createRef<HTMLDivElement>();
  const contextRef = useRef<HTMLDivElement>(null);

  return (
    <MediaContextProvider>
      <style>{mediaStyles}</style>

      <div id={styles.app}>
        <MainNavigation />

        <Sidebar />

        <div className={styles.contentContainer}>
          <MainPageTransition>
            <section ref={contextRef} id={styles.mainContent} className={styles.pageMainInner}>
              <Outlet />
            </section>
          </MainPageTransition>
        </div>

        <WidgetWrapper area='top'>
          <BalanceAndProfit />
        </WidgetWrapper>
        <WidgetWrapper area='bottom'>
          <ClimateImpact />
        </WidgetWrapper>

        <Footer />
      </div>
    </MediaContextProvider>
  );
}
