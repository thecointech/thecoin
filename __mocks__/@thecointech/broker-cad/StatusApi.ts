import { InlineResponse200, StatusApi as SrcApi } from "@thecointech/broker-cad";
import { AxiosResponse } from 'axios';
import { buildResponse } from "../axios-utils";

export class StatusApi implements Pick<SrcApi, keyof SrcApi> {

  status(): Promise<AxiosResponse<InlineResponse200>> {
    return Promise.resolve(
      buildResponse({
        address: "0x1234567890123456789012345678901234567890",
        certifiedFee: 5000,
      })
    );
  }
  timestamp(): Promise<AxiosResponse<number>> {
    return Promise.resolve(
      buildResponse(Date.now())
    );
  }
}
