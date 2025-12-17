import React from "react";
import { Transaction } from "@thecointech/tx-blockchain/";
import { defineMessages, FormattedMessage, MessageDescriptor } from "react-intl";
import { Table } from "semantic-ui-react";
import { Currency } from "@thecointech/site-base/components/Currency";
import { useFxRates } from "@thecointech/shared/containers/FxRate";
import { totalCad } from '@thecointech/shared/containers/Account';

const translations = defineMessages({
  msgTxsIn : {
      defaultMessage: 'In',
      description: 'app.historygraph.tooltip.in: HistoryGraph tooltip - total transaction in'},
  msgTxsOut : {
      defaultMessage: 'Out',
      description: 'app.historygraph.tooltip.out: HistoryGraph tooltip - total transaction out'}
});

export const TooltipTxRows = ({txs}: {txs: Transaction[]}) =>
    <>
      <TooltipTxsRow msg={translations.msgTxsIn} txs={txs.filter(t => t.change > 0)} />
      <TooltipTxsRow msg={translations.msgTxsOut} txs={txs.filter(t => t.change < 0)} />
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


