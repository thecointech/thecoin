import * as React from 'react';
import { hot } from 'react-hot-loader/root'
import { Routes } from './Routes';
import { Container, Segment, Sidebar } from 'semantic-ui-react';
import { PageSidebar } from '@thecointech/shared/containers/PageSidebar';
import { useFxRatesStore } from '@thecointech/shared/containers/FxRate/reducer';
import { FirestoreCheck } from '../FirestoreSignin';
import styles from './styles.module.less';
import { useSidebar } from '@thecointech/shared/containers/PageSidebar/reducer';

const AppRender = () => {
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

export const App = hot(AppRender)