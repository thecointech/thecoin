import React from "react";
import { EncryptedList } from "containers/EncryptedList";
import { ETransferPacket } from "@thecointech/types";
import { Segment } from "semantic-ui-react";
import { TransactionData } from "../../TransferList";
import { RefundButton } from 'containers/Refund';
import { CertifiedTransferRecord } from "@thecointech/utilities/firestore";

const RenderETransfer = (props: TransactionData) => {
  const eTransfer = props.instruction as ETransferPacket;
  const record = props.record as CertifiedTransferRecord;

  return (
    <Segment>
      <div>Email: {eTransfer.email}</div>
      <div>Question: {eTransfer.question}</div>
      <div>Answer: {eTransfer.answer}</div>
      <div>Message: {eTransfer.message}</div>
      <div>Hash: {props.record.hash}</div>
      <RefundButton record={record} />
    </Segment>
  )
}

export const ETransfers = () =>
  <EncryptedList render={RenderETransfer} type="Sell" />
