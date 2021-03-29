import React from "react";
import { Transaction } from "@thecointech/tx-blockchain/";
import { FormattedMessage, MessageDescriptor } from "react-intl";
import { Table } from "semantic-ui-react";
import { Currency } from "@thecointech/site-base/components/Currency";
import { useFxRates } from "@thecointech/shared/containers/FxRate";
import { totalCad } from '@thecointech/shared/containers/Account/profit';

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
  const { rates } = useFxRates();
  const total = totalCad(txs, rates)
  return txs.length
    ? <Table.Row>
        <Table.Cell>
          <FormattedMessage {...msg} />
        </Table.Cell>
        <Table.Cell>
          <Currency value={total} />
        </Table.Cell>
      </Table.Row>
    : null;
}


