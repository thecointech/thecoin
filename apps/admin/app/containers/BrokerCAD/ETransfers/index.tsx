import React from "react";
import { EncryptedList } from "containers/EncryptedList";
import { InstructionPacket } from "containers/EncryptedList/types";
import { ETransferPacket } from "@the-coin/types";
import { Segment } from "semantic-ui-react";

const RenderETransfer = (props: InstructionPacket) => {
  const eTransfer = props as ETransferPacket;
  return (
    <Segment>
      <div>Email: {eTransfer.email}</div>
      <div>Question: {eTransfer.question}</div>
      <div>Answer: {eTransfer.answer}</div>
      <div>Message: {eTransfer.message}</div>
    </Segment>
  )
}

export const ETransfers = () =>
  <EncryptedList render={RenderETransfer} type="Sell" />