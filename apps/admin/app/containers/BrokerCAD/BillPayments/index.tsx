import React from "react";
import { EncryptedList } from "containers/EncryptedList";
import { InstructionPacket } from "containers/EncryptedList/types";
import { BillPayeePacket } from "@the-coin/types";
import { Segment } from "semantic-ui-react";

const RenderBillPayment = (props: InstructionPacket) => {
  const billPay = props as BillPayeePacket;
  return (
    <Segment>
      <div>Payee: {billPay.payee}</div>
      <div>Acc #: {billPay.accountNumber}</div>
    </Segment>
  )
}

export const BillPayments = () =>
  <EncryptedList render={RenderBillPayment} type="Bill" />