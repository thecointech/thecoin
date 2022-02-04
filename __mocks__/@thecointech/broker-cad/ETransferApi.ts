import { CertifiedTransfer, CertifiedTransferResponse, ETransferApi as SrcApi } from "@thecointech/broker-cad";
import { AxiosResponse } from 'axios';
import { buildResponse, delay } from '../axios-utils';
import { GetContract } from '@thecointech/contract-core';
import { sleep } from '@thecointech/async';

export class ETransferApi implements Pick<SrcApi, keyof SrcApi> {
  async eTransfer(request: CertifiedTransfer): Promise<AxiosResponse<CertifiedTransferResponse>> {
    const contract = GetContract();
    const xfer = await contract.certifiedTransfer("", request.transfer.to, request.transfer.value, 5000, 1230, request.signature);
    await sleep(250);
    return buildResponse({
      message: "Success",
      state: "uh?",
      hash: xfer.hash,
    })
  }
  async eTransferInCode(request) {
    await sleep(250);
    return buildResponse({ code: "A1B2C3" })
  }
}
