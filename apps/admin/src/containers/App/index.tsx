import * as React from 'react';
import { Routes } from './Routes';
import { Container, Segment, Sidebar } from 'semantic-ui-react';
import { PageSidebar } from '@thecointech/shared/containers/PageSidebar';
import { FxRateReducer } from '@thecointech/shared/containers/FxRate';
import { FirestoreCheck } from '../FirestoreSignin';
import styles from './styles.module.less';
import { SidebarItemsReducer } from '@thecointech/shared/containers/PageSidebar/reducer';
import { items } from './sidebar';
import { AccountMapReducer } from '@thecointech/shared/containers/AccountMap';
import { initialAccounts } from './accounts';
import 'semantic-ui-css/semantic.min.css'

SidebarItemsReducer.initialize({items})
AccountMapReducer.initialize(await initialAccounts())

export const App = () => {
  FxRateReducer.useStore();
  SidebarItemsReducer.useStore();

  const divStyle = {
    minHeight: "500px"
  };

  return (
    <Sidebar.Pushable as={Segment} className={styles.mainPageContainer}>
      <PageSidebar visible={true} inverted width='thin' />
      <Sidebar.Pusher className={styles.minHeight}>
        <Container style={divStyle}>
          <FirestoreCheck />
          <Routes />
        </Container>
      </Sidebar.Pusher>
    </Sidebar.Pushable>
  );
}
