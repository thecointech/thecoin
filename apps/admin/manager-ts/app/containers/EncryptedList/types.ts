import { BrokerCAD } from "@the-coin/types";

// TODO: Dedup this with definitions in service

export type InstructionPacket = BrokerCAD.BillPayeePacket|BrokerCAD.ETransferPacket;
export type InstructionRenderer = (instruction: InstructionPacket) => JSX.Element;