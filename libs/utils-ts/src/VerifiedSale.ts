import { ETransferPacket, CertifiedTransfer } from "@thecointech/types";
import { Signer } from "ethers";
import { BuildVerifiedAction } from "./VerifiedAction";

// ---------------------------------------------------------\\

// We cannot use the following characters in the question/answer
// Invalid characters: < or >, { or }, [ or ], %, &, #, \ or "
export const invalidChars = /[\s\<\>\{\}\[\]\%\&\#\\\"]/g;

export const BuildVerifiedSale = async (
  eTransfer: ETransferPacket,
  from: Signer,
  to: string,
  value: number,
  fee: number,
): Promise<CertifiedTransfer> => BuildVerifiedAction(eTransfer, from, to, value, fee);
