import { AnyTxAction, TransitionDelta } from '@thecointech/broker-db'
import { RefundButton } from "../../Refund"
import { DateTime } from 'luxon'
import { Icon, List } from "semantic-ui-react";
import { ManualOverride } from './ManualOverride';

export const ClientTransaction = (props: AnyTxAction) => {
  const date = props.data.date;

  // Create default values
  // TODO: move data creation into tx-reconciliation
  const { history } = props;
  const final = history[history.length - 1];
  const fiat = history.find(r => r.fiat)?.fiat ?? "NO FIAT";
  const coin = history.find(r => r.coin)?.coin ?? "NO COIN";

  // TODO: Obvs not gonna work in release
  const project = "tccc-testing";
  const firestorePath = `https://console.cloud.google.com/firestore/databases/-default-/data/panel/User/${props.address}/${props.type}/${props.doc.id}?project=${project}&pli=1`;

  return (
    <List.Item key={props.data.initialId}>
      <TransactionIcon type={final?.type} />
      {`${date.toISODate()} ${final?.type ?? props.type} - ${fiat} : ${coin}`}
      <a href={firestorePath}>{props.data.initialId.slice(0, 10)}</a>
      <TransactionPath {...props.doc} />
      {final?.type == "markComplete"
        ? undefined
        : <RefundButton action={props} />
      }
      {history.map(TransactionEntry)}
      <ManualOverride {...props} />
    </List.Item>
  )
}

const TransactionIcon = ({ type }: { type?: string }) => {
  switch (type) {
    case "markComplete": return <Icon name="check circle outline" color='green' />
    case "error": return <Icon name="times circle outline" color='red' />
    default: return <Icon name="dot circle outline" color='grey' />
  }
}

const TransactionPath = (props: AnyTxAction['doc']) => <div>{props.path}</div>

const TransactionEntry = (props: TransitionDelta) =>
  <li key={props.created.toMillis()}>
    {`${props.created.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)} - ${props.type}`}<br />
    <TransactionEntryHash delta={props} />
    <TransactionEntryItem delta={props} item="date" />
    <TransactionEntryItem delta={props} item="meta" />
    <TransactionEntryItem delta={props} item="error" />
  </li>

const TransactionEntryHash = ({delta}: {delta: TransitionDelta}) => (
  delta.hash
    ? <div>
        &nbsp;&nbsp;&nbsp; - hash:
        <a target="_blank" href={`https://polygonscan.com/tx/${delta.hash}`}>{delta.hash}</a>
      </div>
    : null
)

const TransactionEntryItem = ({delta, item}: {delta: TransitionDelta, item: keyof TransitionDelta}) => (
  delta[item]
    ? <div>&nbsp;&nbsp;&nbsp;{` - ${item}: ${delta[item]?.toString().slice(0, 50)}`}</div>
    : null
)
