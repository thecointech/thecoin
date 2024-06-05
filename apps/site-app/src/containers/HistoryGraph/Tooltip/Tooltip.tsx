import React from "react";
import { TxDatum } from "@thecointech/shared/components/GraphTxHistory/types";
import styles from './styles.module.less';
import { Table } from "semantic-ui-react";
import { Currency } from "@thecointech/site-base/components/Currency";
import { defineMessages, FormattedDate, FormattedMessage } from "react-intl";
import { TooltipTxRows } from "./TooltipTxs";

// Narrow our props so our story doesn't need to pass unnecessary data.
export type TooltipProps = {
  point: {
    data: TxDatum;
  }
}

const translations = defineMessages({
  msgProfit : {
      defaultMessage: 'Growth',
      description: 'app.historygraph.profit: HistoryGraph tooltip - Profit'},
  msgBase : {
      defaultMessage: 'Base',
      description: 'app.historygraph.base: HistoryGraph tooltip - Cost Basis'}
});

export const Tooltip = ({point}: TooltipProps) => {
  const { data } = point;
  return (
    <div id={`${styles.tooltip}`}>
    <Table>
      <Table.Body>
      <Table.Row>
        <Table.Cell>
          <FormattedDate
            year="2-digit"
            month="short"
            day="2-digit"
            value={data.x as Date}
          />
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>
            <FormattedMessage {...translations.msgProfit} />
          </Table.Cell>
        <Table.Cell>
          <Currency value={data.raw - data.costBasis} />
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>
        <FormattedMessage {...translations.msgBase} />
          </Table.Cell>
        <Table.Cell>
          <Currency value={data.costBasis} />
        </Table.Cell>
      </Table.Row>
      <TooltipTxRows txs={data.txs} />
      </Table.Body>
    </Table>
    </div>
  )
}
