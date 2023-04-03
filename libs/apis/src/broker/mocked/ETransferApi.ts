import { CertifiedTransfer, CertifiedTransferResponse, ETransferApi as SrcApi, ETransferCodeResponse, SignedMessage } from "@thecointech/broker-cad";
import type { AxiosResponse } from 'axios';
import { buildResponse } from '../../axios-utils';
import { sleep } from '@thecointech/async';

export class ETransferApi implements Pick<SrcApi, keyof SrcApi> {
  async eTransfer(request: CertifiedTransfer): Promise<AxiosResponse<CertifiedTransferResponse>> {
    await sleep(250);
    return buildResponse({
      message: "Success",
      state: "uh?",
      hash: "0x123456789012345678901234567",
    })
  }

  async eTransferInCode(request: SignedMessage, options?: any): Promise<AxiosResponse<ETransferCodeResponse>> {
    await sleep(250);
    return buildResponse({ code: "A1B2C3" })
  }
}
