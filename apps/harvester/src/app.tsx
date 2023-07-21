import 'semantic-ui-css/semantic.min.css'
import { Menu } from 'semantic-ui-react'
import { Link, useLocation } from 'react-router-dom'
import { Routes } from './app.routes'
import { FxRateReducer } from '@thecointech/shared/containers/FxRate';
import styles from './app.module.less'

export const App = () => {
  FxRateReducer.useStore();
  const location = useLocation();

  return (
    <div className={styles.app}>
      <div>
        <Menu pointing secondary vertical size="small">
          <Menu.Item header>TheCoin - Harvester</Menu.Item>
          <Menu.Item
            name='home'
            active={location.pathname === '/'}
            as={Link}
            to='/'
          />
          <Menu.Item
            name='Account'
            active={location.pathname.startsWith('/account')}
            as={Link}
            to='/account'
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
            onClick={window.scraper.openLogsFolder}
          />
        </Menu>
        {location.pathname}
      </div>
      <div>
        <Routes />
      </div>
    </div>
  )
}
