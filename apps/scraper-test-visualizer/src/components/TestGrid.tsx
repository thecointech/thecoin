import React from 'react';
import { Card } from 'semantic-ui-react';
import { useHistory } from 'react-router-dom';
import type { TestInfo } from '../testInfo';
import { useFilteredTests } from '../state/reducer';
import styles from './TestGrid.module.less';

interface TestGridProps {
  // tests: TestInfo[];
  // failingTests: Set<string>;
  // onTestClick: (test: TestInfo) => void;
}

const TestGrid: React.FC<TestGridProps> = () => {
  const tests = useFilteredTests();
  const history = useHistory();

  const handleTestClick = (test: TestInfo) => {
    history.push(`/test/${encodeURIComponent(test.key)}/${encodeURIComponent(test.element)}`);
  };

  return (
    <div className={styles.testGrid}>
      {tests.map((test) => {
        // const isFailing = failingTests.has(test.name);
        const runCount = 0; //test.groups.length;
        const latestRun = null; //test.groups[0];
        const latestDate = 'N/A'; //latestRun ? new Date(latestRun.timestamp).toLocaleString() : 'N/A';

        return (
          <Card
            key={`${test.key}-${test.element}`}
            className={test.isFailing ? 'failing' : ''}
            onClick={() => handleTestClick(test)}
            style={{ cursor: 'pointer' }}
          >
            <Card.Content>
              <Card.Header>{test.element}</Card.Header>
              <Card.Meta>
                {test.isFailing && (
                  <span style={{ color: '#db2828', fontWeight: 'bold' }}>
                    ⚠ FAILING
                  </span>
                )}
              </Card.Meta>
              <Card.Description>
                <div style={{ marginTop: '0.5rem' }}>
                  <div><strong>Test runs:</strong> {runCount}</div>
                  <div><strong>Latest:</strong> {latestDate}</div>
                </div>
              </Card.Description>
            </Card.Content>
          </Card>
        );
      })}
    </div>
  );
};

export default TestGrid;
