import { ReconciledRecord, isComplete } from "@the-coin/tx-reconciliation"
import React from "react"
import { Button, Icon, List } from "semantic-ui-react"

export const ClientTransaction = (props: ReconciledRecord) =>
  <List.Item>
    <TransactionIcon {...props} />
    {props.action} - {props.data.fiatDisbursed}
    {isComplete(props)
      ? undefined
      : <Button>Refund</Button>
    }
  </List.Item>

const TransactionIcon = (props: ReconciledRecord) =>
  isComplete(props)
      ? <Icon name="check circle outline" color='green' />
      : <Icon name="times circle outline" color='red' />
