import { CertifiedTransferRequest, CertifiedTransferResponse, DirectTransferApi as SrcApi } from "@thecointech/broker-cad";
import type { AxiosResponse } from 'axios';
import { buildResponse } from '../axios-utils';
import { sleep } from '@thecointech/async';

export class DirectTransferApi implements Pick<SrcApi, keyof SrcApi> {
  async transfer(request: CertifiedTransferRequest, options?: any): Promise<AxiosResponse<CertifiedTransferResponse>> {
    await sleep(250);
    return buildResponse({
      message: "Success",
      state: "uh?",
      hash: "0x123456789012345678901234567",
    })
  }
}
