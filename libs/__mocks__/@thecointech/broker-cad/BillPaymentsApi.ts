import { CertifiedTransfer, CertifiedTransferResponse, BillPaymentsApi as SrcApi } from "@thecointech/broker-cad";
import { AxiosResponse } from 'axios';
import { buildResponse } from '../axios-utils';
import { GetContract } from '@thecointech/contract-core';
import { sleep } from '@thecointech/async';

export class BillPaymentsApi implements Pick<SrcApi, keyof SrcApi> {
  async billPayment(request: CertifiedTransfer, options?: any): Promise<AxiosResponse<CertifiedTransferResponse>> {
    const contract = await GetContract();
    const xfer = await contract.certifiedTransfer("", request.transfer.to, request.transfer.value, 5000, 1230, request.signature);
    await sleep(250);
    return buildResponse({
      message: "Success",
      state: "uh?",
      hash: xfer.hash,
    })
  }
}
