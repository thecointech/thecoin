import {
  Controller, Body, Route, Post, Response, Tags,
} from '@tsoa/runtime';
import type { CertifiedTransferRequest } from '@thecointech/types';
import { certifiedTransfer } from '../exchange/VerifiedTransfer';
import type { ServerError, ValidateErrorJSON } from '../types';
import type { CertifiedTransferResponse } from './types';

@Route('transfer')
@Tags('DirectTransfer')
export class TransferController extends Controller {
  /**
     * Transfer to another The Coin account
     * A client may request that the Broker initiate a transfer from their account to another.
     * The transfer includes a fee paid to the broker to cover the cost of the transfer.
     * This allows a user to operate on the Ethereum blockchain without requiring their own ether
     *
     * request CertifiedTransferRequest A request appropriately filled out and signed
     * returns CertifiedTransferResponse
     * */
  @Post()
  @Response('200', 'The response confirms to the user the order transfer is valid and has been initiated')
  @Response<ValidateErrorJSON>(422, 'Validation Failed')
  @Response<ServerError>(500, 'Server Error')
  async transfer(@Body() request: CertifiedTransferRequest) : Promise<CertifiedTransferResponse> {
    const hash = await certifiedTransfer(request);
    return {
      message: 'success',
      hash,
    };
  }

}
