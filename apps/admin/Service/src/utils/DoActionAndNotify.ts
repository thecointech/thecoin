import { BrokerCAD } from "@the-coin/types";
import { DoCertifiedSale } from "exchange/VerifiedSale";
import { SendMail } from "exchange/AutoMailer";
import { VerifiedActionResult } from "exchange/CertifiedActionProcess";
import { success, failure } from "exchange/VerifiedTransfer";

type CertifiedActionFunction = (action: BrokerCAD.CertifiedTransfer) => Promise<VerifiedActionResult>;

/**
 * request CertifiedTransfer Must contain a transfer to this brokers address, and an encrypted ETransferPacket
 * returns CertifiedTransferResponse
 */
export async function DoActionAndNotify(data: BrokerCAD.CertifiedTransfer, action: CertifiedActionFunction) : Promise<BrokerCAD.CertifiedTransferResponse> {
  try {
    const results = await action(data);
    console.log(`Sale Result: ${JSON.stringify(results)}`);
    SendMail("Certified Action: ",  JSON.stringify(results) + "\n---\n" + JSON.stringify(data));
    return success(results.hash);
  }
  catch(err)
  {
    console.error(err);
    SendMail("Certified Action: ERROR", JSON.stringify(err) + "\n---\n" + JSON.stringify(data));
    return failure(err.message)
  };
}
