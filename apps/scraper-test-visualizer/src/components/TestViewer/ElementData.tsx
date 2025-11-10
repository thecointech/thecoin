import React, { useState } from 'react';
import { Table, Icon } from 'semantic-ui-react';
import type { TestElmData } from '@thecointech/scraper-archive';
import { ElementDataCell } from './ElementDataCell';

interface ElementDataProps {
  tests: {
    element: TestElmData;
    title: string;
  }[]
}

const SkipProperties = [
  'frame',
  'parentSelector',
  'parentTagName',
  'font',
]

function getUniqueKeys(sources: any[], skipKeys?: string[]): Set<string> {
  return sources.reduce((acc, source) => {
    Object.entries(source).forEach(([key, value]) => {
      if (value) {
        if (!skipKeys?.includes(key)) {
          acc.add(key);
        }
      }
    });
    return acc;
  }, new Set<string>());
}

export const ElementData: React.FC<ElementDataProps> = ({ tests }) => {
  const [componentsExpanded, setComponentsExpanded] = useState(false);

  if (!tests?.length) return null;

  // Collect all unique component keys
  const dataKeys = getUniqueKeys(tests.map(test => test.element.data), SkipProperties);
  const componentKeys = getUniqueKeys(tests.map(test => test.element.components));

  const originalElement = tests[0]?.element;

  return (
    <Table celled compact size="small">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Property</Table.HeaderCell>
          {tests.map((test, index) => (
            <Table.HeaderCell key={index}>{test.title}</Table.HeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row
          style={{ cursor: 'pointer' }}
          onClick={() => setComponentsExpanded(!componentsExpanded)}
        >
          <Table.Cell>
            <Icon name={componentsExpanded ? 'caret down' : 'caret right'} />
            <strong>Score</strong>
          </Table.Cell>
          {tests.map((test, index) => (
            <ElementDataCell
              key={index}
              value={test.element.score}
              original={originalElement?.score}
            />
          ))}
        </Table.Row>
        {/* Render component rows after score */}
        {componentsExpanded && Array.from(componentKeys).map((key, index) => (
          <Table.Row key={`component-${key}`}>
            <Table.Cell style={{ paddingLeft: '2rem' }}>
              <em>{key}</em>
            </Table.Cell>
            {tests.map((test, index) => (
              <ElementDataCell
                key={index}
                value={test.element.components[key]}
                original={originalElement?.components[key]}
              />
            ))}
          </Table.Row>
        ))}
        {/* Render data rows */}
        {Array.from(dataKeys).map((key, index) => (
          <Table.Row key={`data-${key}`}>
            <Table.Cell>
              <strong>{key}</strong>
            </Table.Cell>
            {tests.map((test, index) => (
              <ElementDataCell
                key={index}
                value={test.element.data[key]}
                original={originalElement?.data[key]}
              />
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};
