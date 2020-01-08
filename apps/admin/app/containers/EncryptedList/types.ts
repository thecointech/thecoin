import { BillPayeePacket, ETransferPacket } from "@the-coin/types";

// TODO: Dedup this with definitions in service

export type InstructionPacket = BillPayeePacket|ETransferPacket;
export type InstructionRenderer = (instruction: InstructionPacket) => JSX.Element;