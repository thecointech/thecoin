import { Routes } from './Routes';
import { Segment, Sidebar } from 'semantic-ui-react';
import { PageSidebar } from '@thecointech/shared/containers/PageSidebar';
import { FxRateReducer } from '@thecointech/shared/containers/FxRate';
import styles from './styles.module.less';
import { SidebarItemsReducer } from '@thecointech/shared/containers/PageSidebar/reducer';

import 'semantic-ui-css/semantic.min.css'

export const App = () => {
  FxRateReducer.useStore();
  SidebarItemsReducer.useStore();

  return (
    <Sidebar.Pushable as={Segment} id={styles.mainPageContainer}>
      <PageSidebar inverted width='thin' />
      <Sidebar.Pusher className={styles.minHeight}>
          <Routes />
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  );
}
