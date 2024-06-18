import { BuildVerifiedAction } from "./VerifiedAction";
import type { Signer } from "ethers";
import type { ETransferPacket, CertifiedTransfer } from "@thecointech/types";

// ---------------------------------------------------------\\

// We cannot use the following characters in the question/answer
// Invalid characters: < or >, { or }, [ or ], %, &, #, \ or "
export const validQuestion  = () => /^[^\<\>\{\}\[\]\%\&\#\\\"]{3,}$/g;
export const validAnswer    = () => /^[^\<\>\{\}\[\]\%\&\#\\\"\s]{3,}$/g;
export const validEmail     = () => /^[^@\s]+@[^@\s]+$/
export const invalidAnswer   = () => /[\<\>\{\}\[\]\%\&\#\\\"\s]/g;
export const invalidQuestion = () => /[\<\>\{\}\[\]\%\&\#\\\"]/g;

export const BuildVerifiedSale = async (
  eTransfer: ETransferPacket,
  from: Signer,
  to: string,
  value: number,
  fee: number,
): Promise<CertifiedTransfer> => BuildVerifiedAction(eTransfer, from, to, value, fee);

//
// Checks eTransfer for minimum viability
export const isPacketValid = (packet: ETransferPacket|null) =>
  packet &&
  packet.question.match(validQuestion()) &&
  packet.answer.match(validAnswer()) &&
  packet.email.match(validEmail()) &&
  !packet.message?.match(invalidQuestion());
