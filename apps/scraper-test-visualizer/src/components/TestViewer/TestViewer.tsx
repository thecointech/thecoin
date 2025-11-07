import React, { useState, useEffect } from 'react';
import { Grid, Header } from 'semantic-ui-react';
import type { TestInfo } from '../../testInfo';
import type { TestResult } from '../../types';
import type { Coords } from '@thecointech/scraper-types';
import styles from './TestViewer.module.less';
import { TestLoading } from './TestLoading';
import { TestError } from './TestError';
import { TestHeader } from './TestHeader';
import { CoordBox, TestScreenshot } from './TestScreenshot';
import { OverrideData } from './OverrideData';
import { ElementData } from './ElementData';
import { SearchParameters } from './SearchParameters';
import { Snapshots } from './Snapshots';

interface TestViewerProps {
  test: TestInfo;
}

export const TestViewer: React.FC<TestViewerProps> = ({ test }) => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [snapshotBoxes, setSnapshotBoxes] = useState<CoordBox[]>([]);
  const [baseCoordBoxes, setBaseCoordBoxes] = useState<CoordBox[]>([]);

  useEffect(() => {
    const fetchTestResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/results/${test.key}/${test.element}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch test results: ${response.statusText}`);
        }
        const data = await response.json();
        setTestResult(data);

        const boxes: CoordBox[] = [{
          coords: data.original.data.coords,
          color: 'blue'
        }];
        if (data.search?.event?.coords) {
          boxes.push({
            coords: data.search.event.coords,
            color: 'green'
          });
        }
        setBaseCoordBoxes(boxes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load test results');
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, [test.key, test.element]);

  const handleSnapshotSelect = (coords: Coords | null) => {
    if (coords) {
      // Add snapshot coords with orange color
      setSnapshotBoxes([{ coords, color: 'orange' }]);
    } else {
      // Remove snapshot coords
      setSnapshotBoxes([]);
    }
  };

  return (
    <div className={styles.testViewer}>
      <TestHeader test={test} />

      <div className={styles.content} style={{ overflowY: 'auto', padding: '1rem' }}>
        <TestLoading loading={loading} />
        <TestError error={error} />

        {!loading && !error && testResult && (
          <Grid>
            <Grid.Row>
              <Grid.Column width={8}>
                <TestScreenshot
                  testKey={test.key}
                  position={testResult.search?.response}
                  coordBoxes={baseCoordBoxes.concat(snapshotBoxes)}
                />
                <OverrideData override={testResult.override} />
              </Grid.Column>

              <Grid.Column width={8}>
                <ElementData element={testResult.original} title="Original Element Data" />
                <SearchParameters search={testResult.search} />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width={16}>
                <Header as="h3">Snapshots ({testResult.snapshot.length})</Header>
                <Snapshots
                  snapshots={testResult.snapshot}
                  onSnapshotSelect={handleSnapshotSelect}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        )}
      </div>
    </div>
  );
};
