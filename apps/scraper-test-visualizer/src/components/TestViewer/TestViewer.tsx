import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Grid, Header } from 'semantic-ui-react';
import type { TestInfo } from '../../testInfo';
import type { TestResult } from '../../types';
import styles from './TestViewer.module.less';
import { TestLoading } from './TestLoading';
import { TestError } from './TestError';
import { TestHeader } from './TestHeader';
import { CoordBox, TestScreenshot } from './TestScreenshot';
import { OverrideData } from './OverrideData';
import { ElementData } from './ElementData';
import { SearchParameters } from './SearchParameters';

interface TestViewerProps {
  test: TestInfo;
}

export const TestViewer: React.FC<TestViewerProps> = ({ test }) => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSnapshot, setSelectedSnapshot] = useState<number | null>(null);

  const [baseCoordBoxes, setBaseCoordBoxes] = useState<CoordBox[]>([]);

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
      if (data.snapshot.length > 0) {
        setSelectedSnapshot(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load test results');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTestResults();
  }, [test.key, test.element]);

  const handleSnapshotSelect = (snapshotIndex: number) => {
    setSelectedSnapshot(snapshotIndex);
  };

  const snapshot = testResult?.snapshot[selectedSnapshot];
  const boxes = snapshot
    ? baseCoordBoxes.concat({
      coords: snapshot.result.found.data.coords,
      color: 'orange'
    })
    : baseCoordBoxes;

  const getTestsToShow = () => {
    const r = [
      {
        element: testResult.original,
        title: 'Original'
      }
    ]
    if (snapshot) {
      r.push({
        element: snapshot.result.found,
        title: `Found (${new Date(snapshot.time).toLocaleString()})`
      })
      if (snapshot.result.match) {
        r.push({
          element: snapshot.result.match,
          title: `Match (${new Date(snapshot.time).toLocaleString()})`
        })
      }
    }
    return r
  }

  async function updateTest(key: string, element: string): Promise<void> {
    setLoading(true);
    try {
      const response = await fetch(`/api/update/${key}/${element}`)
      const result = await response.json();
      console.log(result);
      if (result.success) {
        await fetchTestResults();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.testViewer}>
      <TestHeader test={test} />

      <div className={styles.content} style={{ overflowY: 'auto', padding: '1rem' }}>
        <TestLoading loading={loading} />
        <TestError error={error} />

        {!loading && !error && testResult && (
          <Grid>
            <Grid.Row>
              <Grid.Column width={16}>
                <TestScreenshot
                  testKey={test.key}
                  position={testResult.search?.response}
                  coordBoxes={boxes}
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={16}>
                <Button
                  onClick={() => updateTest(test.key, test.element)}
                >Update</Button>
                <Dropdown
                  options={testResult.snapshot.map((snapshot, index) => ({
                    key: index,
                    text: new Date(snapshot.time).toLocaleString(),
                    value: index,
                  }))}
                  value={selectedSnapshot}
                  onChange={(e, data) => handleSnapshotSelect(data.value as number)}
                />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width={16}>
                <OverrideData override={testResult.override} />
                <ElementData
                  tests={getTestsToShow()}
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={16}>
                <SearchParameters search={testResult.search} />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        )}
      </div>
    </div>
  );
};
