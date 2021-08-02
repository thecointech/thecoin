import React from "react";
import { EncryptedList } from "containers/EncryptedList";
import { Segment } from "semantic-ui-react";
import { BillActionContainer } from '@thecointech/tx-processing/statemachine';

const RenderBillPayment = (props: BillActionContainer) => {
  const billPay = props.instructions;
  return (
    <Segment>
      <div>Payee: {billPay?.payee}</div>
      <div>Acc #: {billPay?.accountNumber}</div>
    </Segment>
  )
}

export const BillPayments = () =>
  <EncryptedList render={RenderBillPayment} type="Bill" />
