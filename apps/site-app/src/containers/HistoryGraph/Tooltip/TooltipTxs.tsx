import React from "react";
import { Transaction } from "@the-coin/tx-blockchain/";
import { FormattedMessage, MessageDescriptor } from "react-intl";
import { sum } from "lodash";
import { Table } from "semantic-ui-react";
import { Currency, useCoinConverter } from "@the-coin/site-base/components/Currency";

const msgTxsIn = { id:"app.historygraph.tooltip.in",
                      defaultMessage:"In",
                      description:"HistoryGraph tooltip - total transaction in"};

const msgTxsOut = { id:"app.historygraph.tooltip.out",
                      defaultMessage:"Out",
                      description:"HistoryGraph tooltip - total transaction in"};

export const TooltipTxRows = ({txs}: {txs: Transaction[]}) =>
    <>
      <TooltipTxsRow msg={msgTxsIn} txs={txs.filter(t => t.change > 0)} />
      <TooltipTxsRow msg={msgTxsOut} txs={txs.filter(t => t.change < 0)} />
    </>

type TooltipTxsRowProps = {
  msg: MessageDescriptor
  txs: Transaction[]
}
const TooltipTxsRow = ({msg, txs}: TooltipTxsRowProps) => {
  const converter = useCoinConverter();
  return txs.length
    ? <Table.Row>
        <Table.Cell>
          <FormattedMessage {...msg} />
        </Table.Cell>
        <Table.Cell>
          <Currency value={sum(txs.map(converter))} />
        </Table.Cell>
      </Table.Row>
    : null;
}


