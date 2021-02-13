import React from "react";
import { TxDatum } from "@the-coin/shared/src/components/GraphTxHistory/types";
import styles from './styles.module.less';
import { Table } from "semantic-ui-react";
import { Currency } from "@the-coin/site-base/components/Currency";

// Narrow our props so our story doesn't need to pass unnecessary data.
export type TooltipProps = {
  point: {
    data: TxDatum;
  }
}

export const Tooltip = ({point}: TooltipProps) => {
  const { data } = point;
  return (
    <div id={`${styles.tooltip}`}>
    <Table>
      <Table.Row>
        <Table.Cell>
          Profit
          </Table.Cell>
        <Table.Cell>
          <Currency value={data.y - data.costBasis} />
        </Table.Cell>
      </Table.Row>
      <Table.Row>
        <Table.Cell>
          Base
          </Table.Cell>
        <Table.Cell>
          <Currency value={data.costBasis} />
        </Table.Cell>
      </Table.Row>
      {
        data.txs.length
          ? <Table.Row>
            <Table.Cell>{data.txs.length} txs</Table.Cell>
          </Table.Row>
          : undefined
      }
    </Table>
    </div>
  )
}
