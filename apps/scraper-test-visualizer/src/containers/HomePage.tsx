import React from 'react';
import { Container, Header, Loader, Message } from 'semantic-ui-react';
import TestGrid from '../components/TestGrid';
import StatsBar from '../components/StatsBar';
import { TestsReducer } from '../state/reducer';
import styles from './HomePage.module.less';

export const HomePage: React.FC = () => {
  const { tests, loading, error, failingTests } = TestsReducer.useData();

  if (loading) {
    return (
      <Container style={{ paddingTop: '2rem' }}>
        <Loader active inline="centered">Loading test results...</Loader>
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={{ paddingTop: '2rem' }}>
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      </Container>
    );
  }

  return (
    <div className={styles.appContainer}>
      <Header size='large'>
        Scraper Element Test Results
        <Header.Subheader>
          Visual comparison of found vs expected elements
        </Header.Subheader>
      </Header>

      <StatsBar tests={tests} failingTests={failingTests} />

      <TestGrid />
    </div>
  );
};
