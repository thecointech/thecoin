import React from 'react';
import { Table, Label } from 'semantic-ui-react';
import type { TestElmData } from '@thecointech/scraper-archive';
import styles from './ElementData.module.less';

interface ElementDataCellProps {
  value: any;
  original: any;
}

export const ElementDataCell: React.FC<ElementDataCellProps> = ({
  value,
  original,
}) => {

  const cellClass = getCellClass(original, value);


  if (!value) return <Table.Cell>-</Table.Cell>;

  switch (typeof value) {
    case "number":
      return <Table.Cell className={cellClass}>{value.toFixed(4)}</Table.Cell>;
    case "object":
      return (
        <Table.Cell className={cellClass}>
          {Object.entries(value as object).map(([k, v]) => (
            <div key={k}>{k}: {typeof v === 'number' ? v.toFixed(2) : String(v)}</div>
          ))}
        </Table.Cell>
      );
    case "boolean":
      return <Table.Cell className={cellClass}>{value ? "true" : "false"}</Table.Cell>;
    default:
      return <Table.Cell className={cellClass}>{String(value)}</Table.Cell>;
  }
};


/**
 * Compares a value from a test element against the original element's value
 * @returns 'match', 'added', 'missing', or 'different'
 */
function getCellClass(originalValue: any, currentValue: any): string {
  // Check if values exist
  if (!originalValue && currentValue) {
    return styles.cellAdded; // Has value but original didn't
  }
  if (originalValue && !currentValue) {
    return styles.cellMissing; // Missing value that original had
  }

  // Compare values based on type
  let isMatch = false;

  if (typeof originalValue === 'object' && typeof currentValue === 'object') {
    isMatch = JSON.stringify(originalValue) === JSON.stringify(currentValue);
  } else if (Array.isArray(originalValue) && Array.isArray(currentValue)) {
    isMatch = originalValue.join(',') === currentValue.join(',');
  } else {
    isMatch = originalValue === currentValue;
  }

  return isMatch ? styles.cellMatch : styles.cellDifferent;
}
