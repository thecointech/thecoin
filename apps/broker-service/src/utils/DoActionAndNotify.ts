import { CertifiedTransfer, CertifiedTransferResponse } from "@the-coin/types";
import { SendMail } from "@the-coin/email";
import { VerifiedActionResult } from "../exchange/CertifiedActionProcess";
import { success, failure } from "../exchange/VerifiedTransfer";

type CertifiedActionFunction = (action: CertifiedTransfer) => Promise<VerifiedActionResult>;

/**
 * request CertifiedTransfer Must contain a transfer to this brokers address, and an encrypted ETransferPacket
 * returns CertifiedTransferResponse
 */
export async function DoActionAndNotify(data: CertifiedTransfer, action: CertifiedActionFunction) : Promise<CertifiedTransferResponse> {
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
