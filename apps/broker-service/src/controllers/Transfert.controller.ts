import { Controller, Body, Route, Post, Response } from 'tsoa';
import { DoCertifiedTransferWaitable, success } from '../exchange/VerifiedTransfer';
import { CertifiedTransferRequest, CertifiedTransferResponse} from '@the-coin/types'


@Route('transfert')
export class TransferController extends Controller {

  @Response('400', 'Bad request')

  /**
     * Transfer to another The Coin account
     * A client may request that the Broker initiate a transfer from their account to another.  The transfer includes a fee paid to the broker to cover the cost of the transfer.  This allows a user to operate on the Ethereum blockchain without requiring their own ether
     *
     * request CertifiedTransferRequest A request appropriately filled out and signed as described in the comments
     * returns CertifiedTransferResponse
     **/
  @Post()
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


