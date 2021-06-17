import { ReconciledRecord, isComplete } from "@thecointech/tx-reconciliation"
import { RefundButton } from "containers/Refund"
import React from "react"
import { Icon, List } from "semantic-ui-react"

export const ClientTransaction = (props: ReconciledRecord) => {
  const { action } = props;
  const date = action.data.date;

  // Create default values
  // TODO: move data creation into tx-reconciliation
  const fiatDisbursed = action.history.find(h => h.fiat);
  const [/*init*/, refunded] = action.history.filter(h => h.hash)
  return (
  <List.Item key={action.data.initialId}>
    <TransactionIcon {...props} />
    {`${date.toISODate()} ${props.action} - ${fiatDisbursed?.fiat?.toNumber()} ${refunded ? '[REFUNDED]' : ''}`}
    {isComplete(props)
      ? undefined
      : <RefundButton action={action} />
    }
  </List.Item>
  )
}

const TransactionIcon = (props: ReconciledRecord) =>
  isComplete(props)
      ? <Icon name="check circle outline" color='green' />
      : true // (props.action.history != null)
        ? <Icon name="times circle outline" color='red' />
        : <Icon name="dot circle outline" color='grey' />
