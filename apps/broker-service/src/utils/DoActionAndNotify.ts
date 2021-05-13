import { SendMail } from "@thecointech/email";
import { CertifiedTransfer, CertifiedTransferResponse } from "@thecointech/types";
import { VerifiedActionResult } from "../exchange/CertifiedActionProcess";
import { success, failure } from "../exchange/VerifiedTransfer";
import { ActionType } from '@thecointech/broker-db';

type CertifiedActionFunction = (action: CertifiedTransfer) => Promise<VerifiedActionResult>;

/**
 * request CertifiedTransfer Must contain a transfer to this brokers address, and an encrypted ETransferPacket
 * returns CertifiedTransferResponse
 */
export async function DoActionAndNotify(type: ActionType, data: CertifiedTransfer, action: CertifiedActionFunction) : Promise<CertifiedTransferResponse> {
  try {
    const results = await action(data);
    console.log(`${type} Result: ${JSON.stringify(results)}`);
    SendMail(`Certified Action ${type}: `,  JSON.stringify(results) + "\n---\n" + JSON.stringify(data));
    return success(results.hash);
  }
  catch(err)
  {
    console.error(err);
    SendMail(`Certified Action ${type}: ERROR`, JSON.stringify(err) + "\n---\n" + JSON.stringify(data));
    return failure(err.message)
  };
}
