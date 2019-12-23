import { BrokerCAD } from "@the-coin/types/lib/BrokerCAD";
import { Signer } from "ethers";
import { BuildVerifiedAction } from "./VerifiedAction";

// ---------------------------------------------------------\\

export const BuildVerifiedSale = async (
  eTransfer: BrokerCAD.ETransferPacket,
  from: Signer,
  to: string,
  value: number,
  fee: number,
) => BuildVerifiedAction(eTransfer, from, to, value, fee);
