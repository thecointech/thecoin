import React from 'react';
import { Container, Header, Loader, Message, Input } from 'semantic-ui-react';
import TestGrid from '../components/TestGrid';
import StatsBar from '../components/StatsBar';
import { TestsReducer, useFilteredTests, useFilteredFailingTests } from '../state/reducer';
import styles from './HomePage.module.less';

export const HomePage: React.FC = () => {
  const { loading, error, filterText } = TestsReducer.useData();
  const actions = TestsReducer.useApi();
  const filteredTests = useFilteredTests();
  const filteredFailingTests = useFilteredFailingTests();

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

      <Input
        icon='search'
        placeholder='Filter by test name...'
        value={filterText}
        onChange={(e) => actions.setFilterText(e.target.value)}
        style={{ marginBottom: '1rem', width: '100%', maxWidth: '400px' }}
      />

      <StatsBar tests={filteredTests} failingTests={filteredFailingTests} />

      <TestGrid />
    </div>
  );
};
