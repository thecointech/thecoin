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
import { MainRouter } from '../MainRouter';
import { useAccountStoreApi } from '@thecointech/shared/containers/AccountMap';
import { addDevLiveAccounts } from '../../api/mock/accounts';

// Either import CSS or LESS;
// - LESS is slower, but offers on-save hot-reload
// - CSS is faster, but requires manual recompile
import '../../semantic/semantic.css';
//import '@thecointech/site-semantic-theme/semantic.less';
import styles from './styles.module.less';


export const App = () => {
  console.log("Loading Site with config: " + process.env.CONFIG_NAME);
  if (process.env.NODE_ENV === 'development') {
    //useDevPrep(account)
    if (process.env.CONFIG_NAME === 'devlive') {
      const accountsApi = useAccountStoreApi();
      React.useEffect(() => { addDevLiveAccounts(accountsApi) })
    }
  }

  return (
    <div id={styles.app}>
      <MainNavigation />
      <div className={styles.contentContainer}>
        <MainPageTransition>
          <section id={styles.mainContent}>
            <MainRouter />
          </section>
        </MainPageTransition>
      </div>
      <Footer />
    </div>
  )
};
