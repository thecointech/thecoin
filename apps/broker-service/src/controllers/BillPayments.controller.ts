import { Controller, Body, Route, Post, Response } from 'tsoa';
import { ProcessBillPayment } from '../exchange/VerifiedBillPayments';
import { CertifiedTransfer } from "@the-coin/types";
import { DoActionAndNotify } from "../utils/DoActionAndNotify";


@Route('bills')
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
    @Response('400', 'Bad request')
    @Response('405', 'Invalid input')
    async billPayment(@Body() request: CertifiedTransfer) {
        await DoActionAndNotify(request, ProcessBillPayment);
    }
}
