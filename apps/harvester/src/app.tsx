import 'semantic-ui-css/semantic.min.css'
import { Menu } from 'semantic-ui-react'
import { Link, useLocation } from 'react-router-dom'
import { Routes } from './app.routes'
import { FxRateReducer } from '@thecointech/shared/containers/FxRate';
import styles from './app.module.less'
import { BrowserDownloadState, BrowserReducer } from './Browser/reducer';
import { useEffect } from 'react';
// import { ReplayProgressReducer } from './ReplayProgress/reducer';
import { BackgroundTaskReducer } from './BackgroundTask/reducer';

export const App = () => {
  FxRateReducer.useStore();
  BrowserReducer.useStore();
  // ReplayProgressReducer.useStore();
  BackgroundTaskReducer.useStore();

  const location = useLocation();
  const openLogs = async () => {
    await window.scraper.openLogsFolder()
  }

  const browserApi = BrowserReducer.useApi();
  // const replayProgressApi = ReplayProgressReducer.useApi();
  const backgroundTaskApi = BackgroundTaskReducer.useApi();

  useEffect(() => {
    window.scraper.onBrowserDownloadProgress((progress: BrowserDownloadState) => {
      browserApi.setDownloadState(progress);
    })
    // window.scraper.onReplayProgress(progress => {
    //   replayProgressApi.setReplayProgress(progress);
    // })
    window.scraper.onBackgroundTaskProgress(progress => {
      backgroundTaskApi.setTaskProgress(progress);
    })
  }, [])

  return (
    <div className={styles.app}>
      <div className={styles.menu}>
        <Menu pointing secondary vertical size="small">
          <Menu.Item header>TheCoin - Harvester</Menu.Item>
          <Menu.Item
            name='home'
            active={location.pathname === '/'}
            as={Link}
            to='/'
          />
          <Menu.Item
            name='Setup'
            active={location.pathname.startsWith('/browser')}
            as={Link}
            to='/browser'
          />
          <Menu.Item
            name='Account'
            active={location.pathname.startsWith('/account')}
            as={Link}
            to='/account'
          />
          <Menu.Item
            name='Agent'
            active={location.pathname.startsWith('/agent')}
            as={Link}
            to='/agent'
          />
          <Menu.Item
            name='Training'
            active={location.pathname.startsWith('/train')}
            as={Link}
            to='/train'
          />
          <Menu.Item
            name='Config'
            active={location.pathname.startsWith('/config')}
            as={Link}
            to='/config'
          />
          <Menu.Item
            name='Results'
            active={location.pathname.startsWith('/results')}
            as={Link}
            to='/results'
          />
          <Menu.Item
            name='Logs'
            onClick={openLogs}
          />
        </Menu>
        {/* {location.pathname} */}
      </div>
      <div className={styles.content}>
        <Routes />
      </div>
    </div>
  )
}
