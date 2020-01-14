import { ETransferPacket, CertifiedTransfer } from "@the-coin/types";
import { Signer } from "ethers";
import { BuildVerifiedAction } from "./VerifiedAction";

// ---------------------------------------------------------\\

export const BuildVerifiedSale = async (
  eTransfer: ETransferPacket,
  from: Signer,
  to: string,
  value: number,
  fee: number,
): Promise<CertifiedTransfer> => BuildVerifiedAction(eTransfer, from, to, value, fee);
