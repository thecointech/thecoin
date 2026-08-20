import { APR, CertifiedTransfer, CertifiedTransferResponse, RPR, PluginsApi as SrcApi, UberTransferAction } from "@thecointech/broker-cad";
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { buildResponse, buildErrorResponse } from '../axios-utils';
import { sleep } from '@thecointech/async';

// Lets storybook/dev consumers simulate the broker-service rejecting a
// plugin-assignment request, e.g. to test the clock-skew error UI in Plugins.tsx
export type AssignPluginFailure = 'timestamp' | 'invalid-signature' | null;
let assignPluginFailure: AssignPluginFailure = null;
export const setAssignPluginFailure = (failure: AssignPluginFailure) => {
  assignPluginFailure = failure;
};

export class PluginsApi implements Pick<SrcApi, keyof SrcApi> {
  async assignPlugin(request: APR, options?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<boolean, any>> {
    await sleep(250);
    if (assignPluginFailure === 'timestamp') {
      throw buildErrorResponse(401, { message: 'Signature timestamped in the future for add plugin' });
    }
    if (assignPluginFailure === 'invalid-signature') {
      throw buildErrorResponse(401, { message: 'Invalid signature' });
    }
    return buildResponse(true)
  }
  async removePlugin(request: RPR, options?: AxiosRequestConfig<any> | undefined): Promise<AxiosResponse<boolean, any>> {
    await sleep(250);
    return buildResponse(true)
  }
}
