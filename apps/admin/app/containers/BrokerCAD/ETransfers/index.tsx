import React from "react";
import { EncryptedList } from "containers/EncryptedList";
import { InstructionPacket } from "containers/EncryptedList/types";
import { ETransferPacket } from "@the-coin/types";

const RenderETransfer = (props: InstructionPacket) => (
  <>
    <div>EMAIL: {(props as ETransferPacket).email}</div>
  </>
)

export const ETransfers = () => {

  return <EncryptedList render={RenderETransfer} type="Sell" />
}