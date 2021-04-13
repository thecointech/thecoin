import { CertifiedTransferRequest, CertifiedTransferResponse } from '@thecointech/types';
import { Controller, Body, Route, Post, Response, Tags } from '@tsoa/runtime';
import { DoCertifiedTransferWaitable, success } from '../exchange/VerifiedTransfer';


@Route('transfer')
@Tags('DirectTransfer')
export class TransferController extends Controller {


  /**
     * Transfer to another The Coin account
     * A client may request that the Broker initiate a transfer from their account to another.  The transfer includes a fee paid to the broker to cover the cost of the transfer.  This allows a user to operate on the Ethereum blockchain without requiring their own ether
     *
     * request CertifiedTransferRequest A request appropriately filled out and signed as described in the comments
     * returns CertifiedTransferResponse
     **/
  @Post()
  @Response('200', 'The response confirms to the user the order transfer is valid and has been initiated')
  @Response('405', 'Invalid input')
  async transfer(@Body() request: CertifiedTransferRequest) : Promise<CertifiedTransferResponse> {
    try {
        const result = await DoCertifiedTransferWaitable(request);
        return success(result.hash);
      }
      catch (e) {
        console.error(JSON.stringify(e));
        throw new Error("Server Error");
      }
  }
}


