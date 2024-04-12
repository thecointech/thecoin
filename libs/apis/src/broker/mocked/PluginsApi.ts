import { APR, CertifiedTransfer, CertifiedTransferResponse, RPR, PluginsApi as SrcApi, UberTransferAction } from "@thecointech/broker-cad";
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildResponse } from '../../axios-utils';
import { sleep } from '@thecointech/async';

export class PluginsApi implements Pick<SrcApi, keyof SrcApi> {
  async assignPlugin(request: APR, options?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<boolean, any>> {
    await sleep(250);
    return buildResponse(true)
  }
  async removePlugin(request: RPR, options?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<boolean, any>> {
    await sleep(250);
    return buildResponse(true)
  }
}
