import * as React from 'react';
import { Routes } from './Routes';
import { Container, Segment, Sidebar } from 'semantic-ui-react';
import { PageSidebar } from '@thecointech/shared/containers/PageSidebar';
import { useFxRatesStore } from '@thecointech/shared/containers/FxRate/reducer';
import { FirestoreCheck } from '../FirestoreSignin';
import styles from './styles.module.less';
import { useSidebar, SidebarItemsReducer } from '@thecointech/shared/containers/PageSidebar/reducer';
import 'semantic-ui-css/semantic.min.css'
import { items } from './sidebar';

SidebarItemsReducer.initialize({items})

export const App = () => {
  useFxRatesStore();
  useSidebar();

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
