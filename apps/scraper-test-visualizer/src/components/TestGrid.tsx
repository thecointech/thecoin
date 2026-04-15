import React from 'react';
import { Card } from 'semantic-ui-react';
import { useNavigate } from 'react-router';
import type { TestInfo } from '../testInfo';
import { useFilteredTests } from '../state/reducer';
import styles from './TestGrid.module.less';


const TestGrid = () => {
  const tests = useFilteredTests();
  const navigate = useNavigate();

  const handleTestClick = (test: TestInfo) => {
    navigate(`/test/${encodeURIComponent(test.key)}/${encodeURIComponent(test.element)}`);
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
            className={test.isFailing ? styles.failing : ''}
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
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <strong>Key:</strong> {test.key.split(':').slice(1).join(':') || test.key}
                  </div>
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
