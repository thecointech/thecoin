/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { MainNavigation } from 'containers/MainNavigation';
import { Footer } from 'components/Footer';
import { MainPageTransition } from '@thecointech/site-base/components/MainPageTransition';
import { Prismic } from 'components/Prismic/reducer';
import { MediaContextProvider, mediaStyles } from '@thecointech/media-context';
import { LinkResolverProvider } from '@thecointech/site-prismic/components';
import type { FilledContentRelationshipField } from '@prismicio/client';
import { Outlet, ScrollRestoration } from 'react-router';

// Either import CSS or LESS;
// - LESS is slower, but offers on-save hot-reload
// - CSS is faster, but requires manual recompile
import '../../semantic/semantic.css';
//import '@thecointech/site-semantic-theme/semantic.less';
import styles from './styles.module.less';

const linkResolver = (doc: FilledContentRelationshipField) => {
  switch (doc.type) {
    case 'article': return `#/blog/${doc.uid}`;
    case 'faq': return `#/faq/${doc.uid}`;
    default: return '#/';
  }
};

export const App = () => {
  Prismic.useStore();

  return (
    <>
      <ScrollRestoration />
      <LinkResolverProvider value={linkResolver}>
      <MediaContextProvider>
        <style>{mediaStyles}</style>
        <div id={styles.landing} >
          <MainNavigation />

          <div className={styles.contentContainer}>
            <MainPageTransition>
              <section>
                <Outlet />
              </section>
            </MainPageTransition>
          </div>

          <Footer />
        </div>
      </MediaContextProvider>
      </LinkResolverProvider>
    </>
  );
}
