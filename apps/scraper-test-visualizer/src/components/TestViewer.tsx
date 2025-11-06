import React, { useState, useEffect } from 'react';
import { Button, Icon, Loader, Message, Accordion, Table, Label, Segment, Header, Grid } from 'semantic-ui-react';
import type { TestInfo } from '../testInfo';
import type { TestResult, TestSnapshot } from '../types';
import styles from './TestViewer.module.less';

interface TestViewerProps {
  test: TestInfo;
  onClose: () => void;
}

export const TestViewer: React.FC<TestViewerProps> = ({ test, onClose }) => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load test results');
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, [test.key, test.element]);

  const handleAccordionClick = (index: number) => {
    setActiveIndex(activeIndex === index ? -1 : index);
  };

  const renderElementData = (data: any, title: string) => {
    if (!data) return null;

    return (
      <Segment>
        <Header as="h4">{title}</Header>
        <Table celled compact size="small">
          <Table.Body>
            {Object.entries(data).map(([key, value]) => {
              if (key === 'coords' && typeof value === 'object') {
                return (
                  <Table.Row key={key}>
                    <Table.Cell><strong>{key}</strong></Table.Cell>
                    <Table.Cell>
                      {Object.entries(value as object).map(([k, v]) => (
                        <div key={k}>{k}: {String(v)}</div>
                      ))}
                    </Table.Cell>
                  </Table.Row>
                );
              }
              if (key === 'components' && typeof value === 'object') {
                return (
                  <Table.Row key={key}>
                    <Table.Cell><strong>{key}</strong></Table.Cell>
                    <Table.Cell>
                      {Object.entries(value as object).map(([k, v]) => (
                        <Label key={k} size="small">
                          {k}: {typeof v === 'number' ? v.toFixed(2) : String(v)}
                        </Label>
                      ))}
                    </Table.Cell>
                  </Table.Row>
                );
              }
              if (Array.isArray(value)) {
                return (
                  <Table.Row key={key}>
                    <Table.Cell><strong>{key}</strong></Table.Cell>
                    <Table.Cell>{value.join(', ')}</Table.Cell>
                  </Table.Row>
                );
              }
              return (
                <Table.Row key={key}>
                  <Table.Cell width={4}><strong>{key}</strong></Table.Cell>
                  <Table.Cell>{String(value)}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </Segment>
    );
  };

  const renderSnapshots = (snapshots: TestSnapshot[]) => {
    if (snapshots.length === 0) {
      return <Message info>No snapshots available</Message>;
    }

    return (
      <Accordion styled fluid>
        {snapshots.map((snapshot, index) => {
          const date = new Date(snapshot.time);
          return (
            <React.Fragment key={index}>
              <Accordion.Title
                active={activeIndex === index}
                index={index}
                onClick={() => handleAccordionClick(index)}
              >
                <Icon name="dropdown" />
                Snapshot {index + 1} - {date.toLocaleString()}
                {snapshot.result.score !== undefined && (
                  <Label color={snapshot.result.score > 0.8 ? 'green' : 'yellow'} style={{ marginLeft: '1rem' }}>
                    Score: {snapshot.result.score.toFixed(3)}
                  </Label>
                )}
              </Accordion.Title>
              <Accordion.Content active={activeIndex === index}>
                {renderElementData(snapshot.result, `Snapshot Result`)}
              </Accordion.Content>
            </React.Fragment>
          );
        })}
      </Accordion>
    );
  };

  return (
    <div className={styles.testViewer}>
      <div className={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>
            {test.key} / {test.element}
          </h2>
          {test.isFailing && (
            <Label color="red" style={{ marginLeft: '1rem' }}>
              Failing
            </Label>
          )}
        </div>
        <Button icon onClick={onClose} inverted>
          <Icon name="close" /> Close
        </Button>
      </div>

      <div className={styles.content} style={{ overflowY: 'auto', padding: '1rem' }}>
        {loading && (
          <Segment>
            <Loader active inline="centered">Loading test results...</Loader>
          </Segment>
        )}

        {error && (
          <Message negative>
            <Message.Header>Error</Message.Header>
            <p>{error}</p>
          </Message>
        )}

        {!loading && !error && testResult && (
          <Grid>
            <Grid.Row>
              <Grid.Column width={8}>
                <Segment>
                  <Header as="h3">Test Screenshot</Header>
                  <img
                    src={`/api/image/${test.key}`}
                    alt={`Screenshot for ${test.key}`}
                    style={{ maxWidth: '300px', border: '1px solid #ddd' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML += '<p>Image not available</p>';
                    }}
                  />
                </Segment>

                {testResult.override && (
                  <Segment>
                    <Header as="h4">Override Data</Header>
                    <Table celled compact size="small">
                      <Table.Body>
                        {Object.entries(testResult.override).map(([key, value]) => (
                          <Table.Row key={key}>
                            <Table.Cell width={4}><strong>{key}</strong></Table.Cell>
                            <Table.Cell>{String(value)}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </Segment>
                )}
              </Grid.Column>

              <Grid.Column width={8}>
                {testResult.original && renderElementData(testResult.original, 'Original Element Data')}

                {testResult.search && (
                  <Segment>
                    <Header as="h4">Search Parameters</Header>
                    <Table celled compact size="small">
                      <Table.Body>
                        {Object.entries(testResult.search).map(([key, value]) => {
                          if (key === 'event' && typeof value === 'object') {
                            return (
                              <Table.Row key={key}>
                                <Table.Cell width={4}><strong>{key}</strong></Table.Cell>
                                <Table.Cell>
                                  {Object.entries(value as object).map(([k, v]) => (
                                    <div key={k}><strong>{k}:</strong> {String(v)}</div>
                                  ))}
                                </Table.Cell>
                              </Table.Row>
                            );
                          }
                          return (
                            <Table.Row key={key}>
                              <Table.Cell width={4}><strong>{key}</strong></Table.Cell>
                              <Table.Cell>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</Table.Cell>
                            </Table.Row>
                          );
                        })}
                      </Table.Body>
                    </Table>
                  </Segment>
                )}
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width={16}>
                <Header as="h3">Snapshots ({testResult.snapshot.length})</Header>
                {renderSnapshots(testResult.snapshot)}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        )}
      </div>
    </div>
  );
};
