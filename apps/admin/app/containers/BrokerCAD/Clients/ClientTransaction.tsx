import { ReconciledRecord, isComplete } from "@the-coin/tx-reconciliation"
import { CertifiedTransferRecord } from "@the-coin/utilities/firestore"
import { RefundButton } from "containers/Refund"
import React from "react"
import { Icon, List } from "semantic-ui-react"

export const ClientTransaction = (props: ReconciledRecord) => {
  const { data } = props;
  // Create default values
  // TODO: move data creation into tx-reconciliation
  const record = {
    ...data,
    transfer: {
      from: props.blockchain?.counterPartyAddress,
      timestamp: props.blockchain?.date.toMillis(),
      ...data.transfer,
    }
  }
  return (
  <List.Item key={props.data.hash}>
    <TransactionIcon {...props} />
    {`${props.action} - ${props.data.fiatDisbursed} ${props.data.hashRefund ? '[REFUNDED]' : ''}`}
    {isComplete(props)
      ? undefined
      : <RefundButton record={record as CertifiedTransferRecord} />
    }
  </List.Item>
  )
}

const TransactionIcon = (props: ReconciledRecord) =>
  isComplete(props)
      ? <Icon name="check circle outline" color='green' />
      : (props.data.hash != null)
        ? <Icon name="times circle outline" color='red' />
        : <Icon name="dot circle outline" color='grey' />
