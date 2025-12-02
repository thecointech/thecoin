/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import * as React from 'react';
import { MainNavigation } from '../MainNavigation';
import { Footer } from 'components/Footer';
import { MainPageTransition } from '@thecointech/site-base/components/MainPageTransition';
import { init } from './init'
import { Outlet } from 'react-router';

// Either import CSS or LESS;
// - LESS is slower, but offers on-save hot-reload
// - CSS is faster, but requires manual recompile
import '../../semantic/semantic.css';
//import '@thecointech/site-semantic-theme/semantic.less';
import styles from './styles.module.less';

init();

export const App = () => {
  return (
    <div id={styles.app}>
      <MainNavigation />
      <div className={styles.contentContainer}>
        <MainPageTransition>
          <section id={styles.mainContent}>
            <Outlet />
          </section>
        </MainPageTransition>
      </div>
      <Footer />
    </div>
  )
};
