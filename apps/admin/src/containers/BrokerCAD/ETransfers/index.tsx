import { EncryptedList } from "../../EncryptedList";
import { Segment } from "semantic-ui-react";
import { RefundButton } from '../../Refund';
import { getCurrentState, SellActionContainer } from '@thecointech/tx-statemachine';

const RenderETransfer = (props: SellActionContainer) => {
  const eTransfer = props.instructions;
  const current = getCurrentState(props);

  return (
    <Segment>
      <div>Email: {eTransfer?.email}</div>
      <div>Question: {eTransfer?.question}</div>
      <div>Answer: {eTransfer?.answer}</div>
      <div>Message: {eTransfer?.message}</div>
      <div>Hash: {current.data.hash}</div>
      <RefundButton action={props.action} />
    </Segment>
  )
}

export const ETransfers = () =>
  <EncryptedList render={RenderETransfer} type="Sell" />
