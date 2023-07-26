import { Controller, Body, Route, Post, Response, Tags } from '@tsoa/runtime';
import { ProcessBillPayment } from '../exchange/VerifiedBillPayments';
import { ProcessUberBillPayment } from '../exchange/uberBillPayment';
import type { ServerError, ValidateErrorJSON } from '../types';
import type { CertifiedTransfer, UberTransferAction } from '@thecointech/types';
import type { CertifiedTransferResponse } from './types';


@Route('bills')
@Tags('BillPayments')
export class BillPaymentsController extends Controller {

    /**
     * Bill Payment
     * Called by the client to pay a bill with coin via a certified transfer
     * Must contain a transfer to this brokers address, and an encrypted BillPayeePacket
     *
     * request CertifiedTransfer Must contain a transfer to this brokers address, and an encrypted BillPayeePacket
     * returns CertifiedTransferResponse
     **/
    @Post("payment")
    @Response('200', 'The response confirms to the user the order has been processed')
    @Response<ValidateErrorJSON>(422, "Validation Failed")
    @Response<ServerError>(500, "Server Error")
    async billPayment(@Body() request: CertifiedTransfer) : Promise<CertifiedTransferResponse> {
        const r = await ProcessBillPayment(request);
        return {
          message: "success",
          ...r,
        }
    }

    @Post("uberBillPayment")
    @Response('200', 'The response confirms to the user the order has been processed')
    @Response<ValidateErrorJSON>(422, "Validation Failed")
    @Response<ServerError>(500, "Server Error")
    async uberBillPayment(@Body() request: UberTransferAction) : Promise<CertifiedTransferResponse> {
        const r = await ProcessUberBillPayment(request);
        return {
          message: "success",
          ...r,
        }
    }
}
