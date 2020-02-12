import { Controller, Body, Route, Post, Response } from 'tsoa';
import { ProcessBillPayment } from '../exchange/VerifiedBillPayments';
import { CertifiedTransfer } from "@the-coin/types";
import { DoActionAndNotify } from "../utils/DoActionAndNotify";


@Route('billpayments')
export class BillPaymentsController extends Controller {

    @Response('400', 'Bad request')

    /**
     * Bill Payment
     * Called by the client to pay a bill with coin via a certified transfer
     *
     * request CertifiedTransfer Must contain a transfer to this brokers address, and an encrypted BillPayeePacket
     * returns CertifiedTransferResponse
     **/
    @Post()
    async billPayment(@Body() request: CertifiedTransfer) {
        await DoActionAndNotify(request, ProcessBillPayment);
    }
}
