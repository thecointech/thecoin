import { Controller, Body, Route, Post, Response } from 'tsoa';
import { CertifiedTransfer, SignedMessage, eTransferCodeResponse } from "@the-coin/types";
import { SendMail } from "../exchange/AutoMailer";
import { DoCertifiedSale } from "../exchange/VerifiedSale";
import { DoActionAndNotify } from "../utils/DoActionAndNotify";
import { GenerateCode } from "../Buy/eTransfer";


@Route('etransfer')
export class ETransferController extends Controller {

  @Response('400', 'Bad request')

  /**
   * Request eTransfer    
   * Called by the client to exchange coin for CAD and send via eTransfer
   *
   * request CertifiedTransfer Must contain a transfer to this brokers address, and an encrypted ETransferPacket
   * returns CertifiedTransferResponse
   **/
  @Post('eTransfer')
  async eTransfer(@Body() request: CertifiedTransfer) {
    await DoActionAndNotify(request, DoCertifiedSale);
  }

    /**
     * Required answer for eTransfer sent to this broker
     * A code unique to the user that is required on all eTransfers sent in to this broker
     *
     * request SignedMessage Signed timestamp message
     * returns eTransferCodeResponse
     **/
    @Post('eTransferInCode')
    async eTransferInCode(@Body() request: SignedMessage) : Promise<eTransferCodeResponse> {
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
}