import 'semantic-ui-css/semantic.min.css'
import { useLocation, Outlet } from 'react-router'
import { FxRateReducer } from '@thecointech/shared/containers/FxRate';
import { useEffect } from 'react';
import { BackgroundTaskReducer } from '../BackgroundTask/reducer';
import { AccountMap } from '@thecointech/shared/containers/AccountMap/reducer';
import { ElectronSigner } from '@thecointech/electron-signer';
import { AccountInitializer } from '../account/AccountInitializer';
import { AppMenu } from './AppMenu';
import styles from './index.module.less'


export const App = () => {
  FxRateReducer.useStore();
  BackgroundTaskReducer.useStore();

  const accountApi = AccountMap.useApi()
  const location = useLocation();
  const backgroundTaskApi = BackgroundTaskReducer.useApi();

  const activeAddress = AccountMap.useData().active;

  useEffect(() => {
    window.scraper.onBackgroundTaskProgress(progress => {
      backgroundTaskApi.setTaskProgress(progress);
    })

    window.scraper.getCoinAccountDetails()
      .then(res => {
        if (res.value?.address) {
          const signer = new ElectronSigner(res.value.address);
          accountApi.addAccount(res.value.name, res.value.address, signer);
          accountApi.setActiveAccount(res.value.address);
        }
      })
      .catch(error => {
        console.error('Failed to get coin account details:', error);
      });
  }, [])

  return (
    <div className={styles.app}>
      <div className={styles.menu}>
        <AppMenu location={location}/>
      </div>
      <div className={styles.content}>
        <Outlet />
      </div>
      {activeAddress && <AccountInitializer address={activeAddress} />}
    </div>
  )
}
