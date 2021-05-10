import React from "react";
import { TxDatum } from "@thecointech/shared/components/GraphTxHistory/types";
import styles from './styles.module.less';
import { Table } from "semantic-ui-react";
import { Currency } from "@thecointech/site-base/components/Currency";
import { FormattedMessage } from "react-intl";
import { TooltipTxRows } from "./TooltipTxs";

// Narrow our props so our story doesn't need to pass unnecessary data.
export type TooltipProps = {
  point: {
    data: TxDatum;
  }
}

const msgProfit = { id:"app.historygraph.profit",
                      defaultMessage:"Growth",
                      description:"HistoryGraph tooltip - Profit"};
const msgBase = { id:"app.historygraph.base",
                      defaultMessage:"Base",
                      description:"HistoryGraph tooltip - Cost Basis"};

export const Tooltip = ({point}: TooltipProps) => {
  const { data } = point;
  return (
    <div id={`${styles.tooltip}`}>
    <Table>
      <Table.Body>
      <Table.Row>
        <Table.Cell>
            <FormattedMessage {...msgProfit} />
          </Table.Cell>
        <Table.Cell>
          <Currency value={data.y - data.costBasis} />
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>
        <FormattedMessage {...msgBase} />
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
