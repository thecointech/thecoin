import React from 'react';
import { Segment, Header, Table, Label } from 'semantic-ui-react';
import type { TestElmData } from '@thecointech/scraper-archive';

interface ElementDataProps {
  element: TestElmData;
  title: string;
}

export const ElementData: React.FC<ElementDataProps> = ({ element, title }) => {
  if (!element) return null;

  const { data, score, components } = element;
  return (
    <Segment>
      <Header as="h4">{title}</Header>
      <Table celled compact size="small">
        <Table.Body>
          <Table.Row key="score">
            <Table.Cell><strong>Score</strong></Table.Cell>
            <Table.Cell>{score.toFixed(4)}</Table.Cell>
          </Table.Row>
          <Table.Row key="components">
            <Table.Cell><strong>Components</strong></Table.Cell>
            <Table.Cell>
              {Object.entries(components as object)
                .filter(([_, v]) => v)
                .map(([k, v]) => (
                <Label key={k} size="small">
                  {k}: {typeof v === 'number' ? v.toFixed(2) : String(v)}
                </Label>
              ))}
            </Table.Cell>
          </Table.Row>
          {Object.entries(data).map(([key, value]) => {
            if (key === 'coords' && typeof value === 'object') {
              return (
                <Table.Row key={key}>
                  <Table.Cell><strong>{key}</strong></Table.Cell>
                  <Table.Cell>
                    {Object.entries(value as object).map(([k, v]) => (
                      <div key={k}>{k}: {String(v.toFixed(2))}</div>
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
