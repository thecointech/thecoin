import { Controller, Body, Route, Post, Put, Response, Tags } from '@tsoa/runtime';
import { ProcessSale } from "../exchange/VerifiedSale";
import { GenerateCode } from "../Buy/eTransfer";
import type { CertifiedTransfer, SignedMessage } from '@thecointech/types';
import type { CertifiedTransferResponse, ETransferCodeResponse } from './types';

@Route('etransfer')
@Tags('ETransfer')
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
    async eTransfer(@Body() request: CertifiedTransfer) : Promise<CertifiedTransferResponse> {
      const r = await ProcessSale(request);
      return {
        message: "success",
        ...r,
      }
    }

    /**
     * Required answer for eTransfer sent to this broker
     * A code unique to the user that is required on all eTransfers sent in to this broker
     *
     * request SignedMessage Signed timestamp message
     * returns ETransferCodeResponse
     **/
    @Put('eTransfer/code')
    @Response('200', 'The requesters unique eTransfer code')
    @Response('405', 'Invalid input')
    async eTransferInCode(@Body() request: SignedMessage) : Promise<ETransferCodeResponse> {
        return {
          code: await GenerateCode(request)
        }
    }
}
