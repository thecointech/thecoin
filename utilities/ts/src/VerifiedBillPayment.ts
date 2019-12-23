import { BrokerCAD } from "@the-coin/types/lib/BrokerCAD";
import { Signer } from "ethers";
import { BuildVerifiedAction } from "./VerifiedAction";


export const BuildVerifiedBillPayment = async (
  payee: BrokerCAD.BillPayeePacket,
  from: Signer,
  to: string,
  value: number,
  fee: number
) => BuildVerifiedAction(payee, from, to, value, fee);
