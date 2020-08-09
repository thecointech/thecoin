import React from "react";
import { EncryptedList } from "containers/EncryptedList";
import { BillPayeePacket } from "@the-coin/types";
import { Segment } from "semantic-ui-react";
import { TransferData } from "@the-coin/tx-processing";

const RenderBillPayment = (props: TransferData) => {
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
