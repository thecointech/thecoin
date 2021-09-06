import React from "react"
import { AnyAction, TransitionDelta } from '@thecointech/broker-db'
import { RefundButton } from "containers/Refund"
import { DateTime } from 'luxon'
import { Icon, List } from "semantic-ui-react";
import { ManualOverride } from './ManualOverride';

export const ClientTransaction = (props: AnyAction) => {
  const date = props.data.date;

  // Create default values
  // TODO: move data creation into tx-reconciliation
  const { history } = props;
  const final = history[history.length - 1];
  const fiat = history.find(r => r.fiat)?.fiat;
  const coin = history.find(r => r.coin)?.coin;

  return (
    <List.Item key={props.data.initialId}>
      <TransactionIcon type={final.type} />
      {`${date.toISODate()} ${final.type} - ${fiat?.toNumber()} : ${coin?.toNumber()}`}
      {final.type == "markComplete"
        ? undefined
        : <RefundButton action={props} />
      }
      {history.map(TransactionEntry)}
      <ManualOverride {...props} />
    </List.Item>
  )
}

const TransactionIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "markComplete": return <Icon name="check circle outline" color='green' />
    case "error": return <Icon name="times circle outline" color='red' />
    default: return <Icon name="dot circle outline" color='grey' />
  }
}

const TransactionEntry = (props: TransitionDelta) =>
  <li key={props.created.toMillis()}>{`${props.created.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)} - ${props.type}`}</li>
