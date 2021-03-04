import { Controller, Body, Route, Post, Put, Response } from 'tsoa';
import { CertifiedTransfer, SignedMessage, eTransferCodeResponse } from "../types";
import { SendMail } from "@the-coin/email";
import { DoCertifiedSale } from "../exchange/VerifiedSale";
import { DoActionAndNotify } from "../utils/DoActionAndNotify";
import { GenerateCode } from "../Buy/eTransfer";


@Route('exchange')
export class ETransferController extends Controller {

    /**
     * Request eTransfer
     * Called by the client to exchange coin for CAD and send via eTransfer
     *
     * request CertifiedTransfer Must contain a transfer to this brokers address, and an encrypted ETransferPacket
     * returns CertifiedTransferResponse
     **/
    @Post('eTransfer')
    @Response('200', 'The response confirms to the user the order has been processed')
    @Response('405', 'Invalid input')
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
    @Put('eTransfer/code')
    @Response('200', 'The requesters unique eTransfer code')
    @Response('405', 'Invalid input')
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
