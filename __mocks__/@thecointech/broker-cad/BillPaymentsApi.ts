import { CertifiedTransfer, CertifiedTransferResponse, BillPaymentsApi as SrcApi } from "@thecointech/broker-cad";
import { AxiosResponse } from 'axios';
import { buildResponse, delay } from '../axios-utils';
import { GetContract } from 'contract-core';

export class BillPaymentsApi implements Pick<SrcApi, keyof SrcApi> {
  async billPayment(request: CertifiedTransfer, options?: any): Promise<AxiosResponse<CertifiedTransferResponse>> {
    const contract = GetContract();
    const xfer = await contract.certifiedTransfer("", request.transfer.to, request.transfer.value, 5000, 1230, request.signature);
    await delay(250);
    return buildResponse({
      message: "Success",
      state: "uh?",
      hash: xfer.hash,
    })
  }
}
