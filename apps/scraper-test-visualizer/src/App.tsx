import React, { useState, useEffect } from 'react';
import { Container, Header, Loader, Message } from 'semantic-ui-react';
import TestGrid from './components/TestGrid';
import ImageViewer from './components/ImageViewer';
import StatsBar from './components/StatsBar';
import type { Test } from './types';
import { TestInfo } from './testInfo';

const App: React.FC = () => {
  const [tests, setTests] = useState<TestInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestInfo | null>(null);
  const [failingTests, setFailingTests] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load test list
      const testsResponse = await fetch('/api/tests');
      if (!testsResponse.ok) throw new Error('Failed to load tests');
      const tests: Test[] = await testsResponse.json();

      // Load failing tests
      const failingResponse = await fetch('/api/failing');
      if (failingResponse.ok) {
        const failingData = await failingResponse.json();
        setFailingTests(new Set(failingData.include || []));
      }
      setTests(tests.map(test => new TestInfo(test)));

      // // Load details for each test
      // const testDetails = await Promise.all(
      //   testNames.map(async (name: string) => {
      //     const response = await fetch(`/api/tests/${name}`);
      //     const data = await response.json();
      //     return {
      //       name,
      //       groups: data.groups,
      //       isFailing: failingTests.has(name),
      //     };
      //   })
      // );

      // setTests(testDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTestClick = (test: TestInfo) => {
    setSelectedTest(test);
  };

  const handleCloseViewer = () => {
    setSelectedTest(null);
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
        tests={tests}
        failingTests={failingTests}
        onTestClick={handleTestClick}
      />

      {selectedTest && (
        <ImageViewer
          test={selectedTest}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
};

export default App;
