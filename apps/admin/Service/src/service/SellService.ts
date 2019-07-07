import { SendMail } from '../exchange/AutoMailer';
import { DoCertifiedSale } from '../exchange/VerifiedSale';
import { BrokerCAD } from '@the-coin/types';

/**
 * Request coin sale
 * Called by the client to exchange coin for CAD using a certified transfer
 *
 * request CertifiedSale Signed certified transfer to this brokers address
 * returns CertifiedTransferResponse
 **/
export async function certifiedCoinSale(request: BrokerCAD.CertifiedSale): Promise<BrokerCAD.CertifiedTransferResponse> {
  try {
    const results = await DoCertifiedSale(request);
    console.log(`Sale Result: ${JSON.stringify(results)}`);
    SendMail("Certified Coin Sale: ",  JSON.stringify(results) + "\n---\n" + JSON.stringify(request));
    return {
      txHash: results.hash,
      message: "Success"
    }
  }
  catch(err)
  {
    console.error(err);
    SendMail("Certified Coin Sale: ERROR", JSON.stringify(err) + "\n---\n" + JSON.stringify(request));
    throw(err)
  };
}