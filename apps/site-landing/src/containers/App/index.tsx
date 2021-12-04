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

import {MainNavigation} from 'containers/MainNavigation';
import {Footer} from 'components/Footer';
import { MainPageTransition } from '@thecointech/site-base/components/MainPageTransition';
import { routes } from './Routes';
import { Prismic } from 'components/Prismic/reducer';
import { MediaContextProvider, mediaStyles } from '@thecointech/shared/components/ResponsiveTool';

// Either import CSS or LESS;
// - LESS is slower, but offers on-save hot-reload
// - CSS is faster, but requires manual recompile
//import '../../semantic/semantic.css';
import '@thecointech/site-semantic-theme/semantic.less';
import styles from './styles.module.less';

export const App = () => {
  Prismic.useStore();

  return (
    <div id={styles.app}>
      <MediaContextProvider>
        <style>{mediaStyles}</style>
        <MainNavigation />

        <Container className={styles.appContainer}>
          <MainPageTransition routes={routes} />
        </Container>
        <Footer />
      </MediaContextProvider>
    </div>
  );
}
