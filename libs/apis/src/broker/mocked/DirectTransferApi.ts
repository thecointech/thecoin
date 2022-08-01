import { CertifiedTransferRequest, CertifiedTransferResponse, DirectTransferApi as SrcApi } from "@thecointech/broker-cad";
import type { AxiosResponse } from 'axios';
import { buildResponse } from '../../axios-utils';
import { GetContract } from '@thecointech/contract-core';
import { sleep } from '@thecointech/async';

export class DirectTransferApi implements Pick<SrcApi, keyof SrcApi> {
  async transfer(request: CertifiedTransferRequest, options?: any): Promise<AxiosResponse<CertifiedTransferResponse>> {
    const contract = await GetContract();
    const xfer = await contract.certifiedTransfer("", request.to, request.value, 5000, 1230, request.signature);
    await sleep(250);
    return buildResponse({
      message: "Success",
      state: "uh?",
      hash: xfer.hash,
    })
  }
}
