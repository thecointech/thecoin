import type { Heartbeat, HarvesterApi as SrcApi } from "@thecointech/broker-cad";
import { buildResponse } from "../axios-utils";
import type { AxiosResponse } from 'axios';

export class HarvesterApi implements Pick<SrcApi, keyof SrcApi> {
  heartbeat(): Promise<AxiosResponse<boolean, any>> {
    return Promise.resolve(
      buildResponse(true)
    );
  }
}
