import React from "react";
import { EncryptedList } from "containers/EncryptedList";
import { InstructionPacket } from "containers/EncryptedList/types";
import { BrokerCAD } from "@the-coin/types";

const RenderETransfer = (props: InstructionPacket) => (
  <>
    <div>EMAIL: {(props as BrokerCAD.ETransferPacket).email}</div>
  </>
)

export const ETransfers = () => {

  return <EncryptedList render={RenderETransfer} type="Sell" />
}