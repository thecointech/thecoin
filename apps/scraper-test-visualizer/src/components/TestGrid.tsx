import React from 'react';
import { Card } from 'semantic-ui-react';
import type { TestInfo } from '../testInfo';

interface TestGridProps {
  tests: TestInfo[];
  failingTests: Set<string>;
  onTestClick: (test: TestInfo) => void;
}

const TestGrid: React.FC<TestGridProps> = ({ tests, onTestClick }) => {
  return (
    <div className="test-grid">
      {tests.map((test) => {
        // const isFailing = failingTests.has(test.name);
        const runCount = 0; //test.groups.length;
        const latestRun = null; //test.groups[0];
        const latestDate = 'N/A'; //latestRun ? new Date(latestRun.timestamp).toLocaleString() : 'N/A';

        return (
          <Card
            key={test.key}
            className={test.isFailing ? 'failing' : ''}
            onClick={() => onTestClick(test)}
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
