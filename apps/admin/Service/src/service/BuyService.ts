import { BrokerCAD } from "@the-coin/types/lib/BrokerCAD";
import { GenerateCode } from "../Buy/eTransfer";


/**
 * Coin e-Transfer secret answer
 * A unique code for the requesting user to use as an answer to their e-Transfer question
 *
 * request SignedMessage Signed certified transfer to this brokers address
 * returns eTransferCodeResponse
 **/
export async function eTransferCode(request: BrokerCAD.SignedMessage): Promise<BrokerCAD.eTransferCodeResponse> {
  try {
    const code = await GenerateCode(request);
    return {
      code
    }
  }
  catch(e) {
    console.error(JSON.stringify(e));
    throw new Error("Server Error");
  }
}

