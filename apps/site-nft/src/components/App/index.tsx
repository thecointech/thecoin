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

// // Copied from Account/Account.tsx.  Necessary in dev
// // mode to hook up the accounts we automatically add.
// // HOWEVER: In the near future we will transition to
// // a split sandbox for the websites, so don't worry if
// // this code feels a little shonky, it'll be reviewed soon.
// const useDevPrep = (account: AccountState) => {
//   const api = useAccountApi(account.address);
//   // prepare account for usage
//   useEffect(() => {
//     // Is this a remote account?
//     const { signer, contract } = account!;
//     if (isSigner(signer)) {
//       if (!signer.provider)
//         connectSigner(account, api);
//       else if (!contract) {
//         // When a new account is added to account map,
//         // it will be missing the contract.  Here we
//         // enforce that connection for all cases
//         api.connect();
//       }
//     }
//   })
// }
