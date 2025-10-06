import 'semantic-ui-css/semantic.min.css'
import { Menu } from 'semantic-ui-react'
import { Link, useLocation } from 'react-router-dom'
import { Routes } from './app.routes'
import { FxRateReducer } from '@thecointech/shared/containers/FxRate';
import styles from './app.module.less'
import { useEffect } from 'react';
import { BackgroundTaskReducer } from './BackgroundTask/reducer';
import { AccountMap } from '@thecointech/shared/containers/AccountMap/reducer';
import { ElectronSigner } from '@thecointech/electron-signer';
import { AccountInitializer } from './account/AccountInitializer';

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

    window.scraper.getCoinAccountDetails().then(res => {
      if (res.value?.address) {
        const signer = new ElectronSigner(res.value.address);
        accountApi.addAccount(res.value.name, res.value.address, signer);
        accountApi.setActiveAccount(res.value.address);
      }
    });
  }, [])

  return (
    <div className={styles.app}>
      <div className={styles.menu}>
        <Menu pointing secondary vertical size="small">
          <Menu.Item header>TheCoin - Harvester</Menu.Item>
          <Menu.Item
            name='Welcome'
            active={location.pathname === '/'}
            as={Link}
            to='/'
          />
          <Menu.Item
            name='Get Started'
            active={location.pathname.startsWith('/browser')}
            as={Link}
            to='/browser'
          />
          <Menu.Item
            name='Connect Coin Account'
            active={location.pathname.startsWith('/account')}
            as={Link}
            to='/account'
          />
          <Menu.Item
            name='Connect Bank Account'
            active={location.pathname.startsWith('/agent')}
            as={Link}
            to='/agent'
          />
          {/*<Menu.Item
            name='Reset TwoFA'
            active={location.pathname.startsWith('/twofaRefresh')}
            as={Link}
            to='/twofaRefresh'
          />
           <Menu.Item
            name='Training'
            active={location.pathname.startsWith('/train')}
            as={Link}
            to='/train'
          /> */}
          <Menu.Item
            name='Transfer Settings'
            active={location.pathname.startsWith('/config')}
            as={Link}
            to='/config'
          />
          <Menu.Item
            name='My Dashboard'
            active={location.pathname.startsWith('/results')}
            as={Link}
            to='/results'
          />
          <Menu.Item
            name='Advanced Settings'
            active={location.pathname.startsWith('/advanced')}
            as={Link}
            to='/advanced'
          />
        </Menu>
      </div>
      <div className={styles.content}>
        <Routes />
      </div>
      {activeAddress && <AccountInitializer address={activeAddress} />}
    </div>
  )
}
