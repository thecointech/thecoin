import { CertifiedTransfer, CertifiedTransferResponse, ETransferApi as SrcApi } from "@thecointech/broker-cad";
import { AxiosResponse } from 'axios';
import { buildResponse, delay } from '../axios-utils';
import { GetContract } from '../contract';

export class ETransferApi implements Pick<SrcApi, keyof SrcApi> {
  async eTransfer(_request: CertifiedTransfer): Promise<AxiosResponse<CertifiedTransferResponse>> {
    const contract = await GetContract();
    const xfer = await contract.certifiedTransfer();
    await delay(250);
    return buildResponse({
      message: "Success",
      state: "uh?",
      hash: xfer.hash,
    })
  }
  async eTransferInCode(request) {
    await delay(250);
    return buildResponse({ code: "A1B2C3" })
  }
}
