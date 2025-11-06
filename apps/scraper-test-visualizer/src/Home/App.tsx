import React, { useEffect } from 'react';
import { Container, Header, Loader, Message } from 'semantic-ui-react';
import TestGrid from '../components/TestGrid';
import {TestViewer} from '../components/TestViewer';
import StatsBar from '../components/StatsBar';
import { TestInfo } from '../testInfo';
import { TestsReducer } from '../state/reducer';

const App: React.FC = () => {
  // Initialize Redux store for tests
  TestsReducer.useStore();

  // Get actions and data from Redux
  const actions = TestsReducer.useApi();
  const { tests, loading, error, selectedTest, failingTests } = TestsReducer.useData();

  const handleTestClick = (test: TestInfo) => {
    actions.setSelectedTest(test);
  };

  const handleCloseViewer = () => {
    actions.setSelectedTest(null);
  };

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
    <div className="app-container">
      <Header size='large'>
        Scraper Element Test Results
        <Header.Subheader>
          Visual comparison of found vs expected elements
        </Header.Subheader>
      </Header>

      <StatsBar tests={tests} failingTests={failingTests} />

      <TestGrid
        onTestClick={handleTestClick}
      />

      {selectedTest && (
        <TestViewer
          test={selectedTest}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
};

export default App;
