import { BrokerCAD } from "@the-coin/types";
import { SendMail } from "../exchange/AutoMailer";
import { DoCertifiedSale } from "../exchange/VerifiedSale";
import { DoActionAndNotify } from "../utils/DoActionAndNotify";
import { GenerateCode } from "../Buy/eTransfer";

/**
 * Request eTransfer
 * Called by the client to exchange coin for CAD and send via eTransfer
 *
 * request CertifiedTransfer Must contain a transfer to this brokers address, and an encrypted ETransferPacket
 * returns CertifiedTransferResponse
 **/
export function eTransfer(request: BrokerCAD.CertifiedTransfer) {
  return DoActionAndNotify(request, DoCertifiedSale);
}


/**
 * Required answer for eTransfer sent to this broker
 * A code unique to the user that is required on all eTransfers sent in to this broker
 *
 * request SignedMessage Signed timestamp message
 * returns eTransferCodeResponse
 **/
export async function eTransferInCode(request: BrokerCAD.SignedMessage) : Promise<BrokerCAD.eTransferCodeResponse> {
  try {
    return {
      code: await GenerateCode(request)
    }    
  }
  catch (err) {
    console.error(err.message);
    SendMail("TransferCode Error", JSON.stringify(err) + "\n---\n" + JSON.stringify(request));
    return { 
      code: "TheCoin",
      error: "server Error",
    }
  }
}

