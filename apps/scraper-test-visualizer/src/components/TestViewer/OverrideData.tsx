import React from 'react';
import { Segment, Header, Table } from 'semantic-ui-react';
import type { OverrideElement } from '@thecointech/scraper-archive';

interface OverrideDataProps {
  override?: OverrideElement;
}

export const OverrideData: React.FC<OverrideDataProps> = ({ override }) => {
  if (!override) return null;
  return (
    <Segment>
      <Header as="h4">Override Data</Header>
      <Table celled compact size="small">
        <Table.Body>
          {Object.entries(override).map(([key, value]) => (
            <Table.Row key={key}>
              <Table.Cell width={4}><strong>{key}</strong></Table.Cell>
              <Table.Cell>{String(value)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Segment>
  );
};
