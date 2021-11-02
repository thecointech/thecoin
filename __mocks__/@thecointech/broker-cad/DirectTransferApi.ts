import { CertifiedTransfer, CertifiedTransferRequest, CertifiedTransferResponse, DirectTransferApi as SrcApi } from "@thecointech/broker-cad";
import { AxiosResponse } from 'axios';
import { buildResponse, delay } from '../axios-utils';
import { GetContract } from 'contract-core;

export class DirectTransferApi implements Pick<SrcApi, keyof SrcApi> {
  async transfer(request: CertifiedTransferRequest, options?: any): Promise<AxiosResponse<CertifiedTransferResponse>> {
    const contract = GetContract();
    const xfer = await contract.certifiedTransfer("", request.to, request.value, 5000, 1230, request.signature);
    await delay(250);
    return buildResponse({
      message: "Success",
      state: "uh?",
      hash: xfer.hash,
    })
  }
}
