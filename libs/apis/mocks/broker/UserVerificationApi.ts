import type { UserVerificationApi as SrcApi, BlockpassPayload } from "@thecointech/broker-cad";
import { AxiosResponse } from 'axios';
import { buildResponse } from "../axios-utils";
import { updateKyc } from "./kycState";

export class UserVerificationApi implements Pick<SrcApi, keyof SrcApi> {
  updateStatus(_xHubSignature: string, payload: BlockpassPayload, _options?: any): Promise<AxiosResponse<void>> {
    updateKyc(payload);
    return Promise.resolve(
      buildResponse(undefined as any) // not technically void, but meh
    );
  }
}
