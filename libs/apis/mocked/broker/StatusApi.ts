import type { StatusApi as SrcApi } from "@thecointech/broker-cad";
import { buildResponse } from "../axios-utils";

export class StatusApi implements Pick<SrcApi, keyof SrcApi> {

  status() {
    return Promise.resolve(
      buildResponse({
        address: "0x1234567890123456789012345678901234567890",
        certifiedFee: 0,
      })
    );
  }
  timestamp() {
    return Promise.resolve(
      buildResponse(Date.now())
    );
  }
}
