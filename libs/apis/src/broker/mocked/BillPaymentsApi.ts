import { CertifiedTransfer, CertifiedTransferResponse, BillPaymentsApi as SrcApi, UberTransferAction } from "@thecointech/broker-cad";
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildResponse } from '../../axios-utils';
import { sleep } from '@thecointech/async';

export class BillPaymentsApi implements Pick<SrcApi, keyof SrcApi> {

  async billPayment(request: CertifiedTransfer, options?: any): Promise<AxiosResponse<CertifiedTransferResponse>> {
    await sleep(250);
    return buildResponse({
      message: "Success",
      state: "uh?",
      hash: "0x123456789012345678901234567",
    })
  }

  async uberBillPayment(request: UberTransferAction, options?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<CertifiedTransferResponse, any>> {
    await sleep(250);
    return buildResponse({
      message: "Success",
      state: "uh?",
      hash: "0x123456789012345678901234567",
    })
  }
}
