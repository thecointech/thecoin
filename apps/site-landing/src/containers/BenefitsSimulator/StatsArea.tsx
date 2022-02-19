import React from 'react';
import { last } from '@thecointech/utilities';
import { BenefitsReducer } from './reducer';
import { netFiat, SimulationState } from './simulator';
import { Table } from 'semantic-ui-react'
import { zero } from './simulator/sim.decimal';
import styles from './styles.module.less';

export const StatsArea = () => {

  BenefitsReducer.useStore();
  const { hovered, results, percentile } = BenefitsReducer.useData();
  const selected = hovered ?? last(results);

  const data = getTableData(selected?.values, percentile);
  const maybeFiat = (s?: SimulationState) => s ? netFiat(s) : null;

  return (
    <Table singleLine celled selectable className={styles.statsContainer} >
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>{tc("Avg", selected?.median, "$")}</Table.HeaderCell>
          <Table.HeaderCell>{tc("Weeks", selected?.week)}</Table.HeaderCell>
          <Table.HeaderCell>{tc("Principal", data?.principal)}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        <Table.Row positive>
          <Table.Cell>{tc("Best", maybeFiat(data?.best), "$")}</Table.Cell>
          <Table.Cell>{tc("From", data?.best.date.minus({ week: selected.week }))}</Table.Cell>
          <Table.Cell>{tc("To", data?.best.date)}</Table.Cell>
        </Table.Row>
        <Table.Row negative>
          <Table.Cell>{tc("Worst", maybeFiat(data?.worst), "$")}</Table.Cell>
          <Table.Cell>{tc("From", data?.worst.date.minus({ week: selected.week }))}</Table.Cell>
          <Table.Cell>{tc("To", data?.worst.date)}</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
}

const getTableData = (values: SimulationState[], percentile: number) => {
  if (!values || values.length < 1)
    return undefined;

  const midIndex = values.length / 2;
  const lowerBoundIdx = Math.floor(midIndex - midIndex * percentile);
  const upperBoundIdx = Math.floor(midIndex - 1 + midIndex * percentile);

  const principal = values
    .reduce((p, curr) => p.add(curr.principal), zero)
    .div(values.length);
  const worst = values[lowerBoundIdx];
  const best = values[upperBoundIdx];
  return { principal, worst, best };
}



const tc = (intro: string, text?: any, symbol?: string) =>
  <>
    <b>{intro}: </b>
    {symbol ?? ''}
    {text?.toFixed?.(2) ?? text?.toSQLDate?.() ?? text ?? ''}
  </>
