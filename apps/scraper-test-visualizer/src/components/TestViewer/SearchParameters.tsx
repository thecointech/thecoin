import React from 'react';
import { Segment, Header, Table } from 'semantic-ui-react';
import type { TestSchData } from '@thecointech/scraper-archive';

interface SearchParametersProps {
  search: TestSchData;
}

export const SearchParameters: React.FC<SearchParametersProps> = ({ search }) => {
  if (!search) {
    return <Segment>
      <Header size='small'>Search Parameters</Header>
      <p>No search parameters found</p>
    </Segment>
  };
  return (
    <Segment>
      <Header size="small">Search Parameters</Header>
      <Table celled compact size="small">
        <Table.Body>
          {Object.entries(search).map(([key, value]) => {
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
  );
};
