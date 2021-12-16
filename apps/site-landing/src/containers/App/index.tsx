/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import * as React from 'react';
import {MainNavigation} from 'containers/MainNavigation';
import {Footer} from 'components/Footer';
import { MainPageTransition } from '@thecointech/site-base/components/MainPageTransition';
import { Routes } from './Routes';
import { Prismic } from 'components/Prismic/reducer';
import { MediaContextProvider, mediaStyles } from '@thecointech/shared/components/ResponsiveTool';

// Either import CSS or LESS;
// - LESS is slower, but offers on-save hot-reload
// - CSS is faster, but requires manual recompile
import '../../semantic/semantic.css';
//import '@thecointech/site-semantic-theme/semantic.less';
import styles from './styles.module.less';

export const App = () => {
  Prismic.useStore();

  return (
    <MediaContextProvider>
      <style>{mediaStyles}</style>
      <div id={styles.landing} className={styles.layoutColumns}>
        <MainNavigation />

        <div className={styles.contentContainer}>
          <MainPageTransition>
            <section id={styles.mainContent} className={styles.pageMainInner}>
              <Routes />
            </section>
          </MainPageTransition>
        </div>

        <Footer />
      </div>
    </MediaContextProvider>
  );
}
