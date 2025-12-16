import { Segment, Sidebar } from 'semantic-ui-react';
import { PageSidebar, SidebarItemsReducer } from '@thecointech/shared/containers/PageSidebar';
import { FxRateReducer } from '@thecointech/shared/containers/FxRate';
import styles from './styles.module.less';
import { Outlet } from 'react-router';

import 'semantic-ui-css/semantic.min.css'

export const App = () => {
  FxRateReducer.useStore();
  SidebarItemsReducer.useStore();

  return (
    <Sidebar.Pushable as={Segment} id={styles.mainPageContainer}>
      <PageSidebar inverted width='thin' />
      <Sidebar.Pusher className={styles.minHeight}>
          <Outlet />
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  );
}
