import type { HarvesterApi as SrcApi, StartRun200Response } from "@thecointech/broker-cad";
import { buildResponse } from "../axios-utils";
import type { AxiosResponse } from 'axios';

export class HarvesterApi implements Pick<SrcApi, keyof SrcApi> {
  completeRun(): Promise<AxiosResponse<boolean, any, {}>> {
    return Promise.resolve(buildResponse(true));
  }
  register(): Promise<AxiosResponse<boolean, any, {}>> {
    return Promise.resolve(buildResponse(true));
  }
  startRun(): Promise<AxiosResponse<StartRun200Response, any, {}>> {
    return Promise.resolve(buildResponse({ runId: "test-run-id" }));
  }
}
