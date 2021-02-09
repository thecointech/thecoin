import React from "react";
import { EncryptedList } from "containers/EncryptedList";
import { BillPayeePacket } from "@the-coin/types";
import { Segment } from "semantic-ui-react";
import { TransactionData } from "containers/TransferList";

const RenderBillPayment = (props: TransactionData) => {
  const billPay = props.instruction as BillPayeePacket;
  return (
    <Segment>
      <div>Payee: {billPay.payee}</div>
      <div>Acc #: {billPay.accountNumber}</div>
    </Segment>
  )
}

export const BillPayments = () =>
  <EncryptedList render={RenderBillPayment} type="Bill" />
