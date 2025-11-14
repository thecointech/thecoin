import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Grid, Header } from 'semantic-ui-react';
import type { TestInfo } from '../../testInfo';
import type { TestResult } from '../../types';
import styles from './TestViewer.module.less';
import { TestLoading } from './TestLoading';
import { TestError } from './TestError';
import { TestHeader } from './TestHeader';
import { TestScreenshot } from './TestScreenshot';
import { OverrideData } from './OverrideData';
import { ElementData } from './ElementData';
import { SearchParameters } from './SearchParameters';
import { colors, names } from './colors';
import { TestsReducer } from '../../state/reducer';

interface TestViewerProps {
  test: TestInfo;
}

export const TestViewer: React.FC<TestViewerProps> = ({ test }) => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSnapshot, setSelectedSnapshot] = useState<number | null>(null);
  const actions = TestsReducer.useApi();

  const updateFailing = async () => {
    const failingResponse = await fetch('/api/failing');
    if (failingResponse.ok) {
      const failingData = await failingResponse.json();
      actions.setFailingTests(failingData);
    }
  }

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

  const getSnapshotElements = () => {
    const snapshot = testResult?.snapshot[selectedSnapshot];
    const r = [testResult.original];
    if (snapshot) {
      r.push(snapshot.result.found);
      if (snapshot.result.match) {
        if (snapshot.result.found.data.selector !== testResult.original.data.selector) {
          r.push(snapshot.result.match);
        }
      }
    }
    return r;
  }

  const getBoxesToDraw = () => {
    const r = [];
    if (testResult?.search?.event?.coords) {
      r.push({
        coords: testResult?.search?.event?.coords,
        color: 'red',
      });
    }
    r.push(...getSnapshotElements().map((s, i) => ({ coords: s.data.coords, color: colors[i] })));
    return r;
  }
  const getTestsToShow = () => getSnapshotElements().map((s, i) => ({
    element: s,
    title: names[i],
    color: colors[i]
  }));

  async function updateTest(key: string, element: string): Promise<void> {
    setLoading(true);
    try {
      const response = await fetch(`/api/update/${key}/${element}`)
      const result = await response.json();
      console.log(result);
      if (result.success) {
        await fetchTestResults();
        await updateFailing();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function openTestFolder(key: string): Promise<void> {
    try {
      const response = await fetch(`/api/open-folder/${key}`, {
        method: 'POST',
      });
      const result = await response.json();
      if (!result.success) {
        console.error('Failed to open folder:', result.message);
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  }

  async function applyOverride(key: string, element: string): Promise<void> {
    setLoading(true);
    try {
      const response = await fetch(`/api/apply-override/${key}/${element}`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        console.log('Override applied:', result.changes);

        // Reload failing tests
        await updateFailing();
        // Refresh test results to show new override
        await fetchTestResults();
      } else {
        console.log('No override needed:', result.message);
      }
    } catch (error) {
      console.error('Failed to apply override:', error);
      setError(error instanceof Error ? error.message : 'Failed to apply override');
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
                  coordBoxes={getBoxesToDraw()}
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={16}>

                <Button
                  onClick={() => updateTest(test.key, test.element)}
                >Update</Button>
                <Button
                  color="blue"
                  onClick={() => applyOverride(test.key, test.element)}
                >Override</Button>
                <Button
                  onClick={() => openTestFolder(test.key)}
                >Open Folder</Button>
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
