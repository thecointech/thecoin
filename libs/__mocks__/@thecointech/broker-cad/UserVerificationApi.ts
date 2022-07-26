import { UserVerifyData, StatusType, UserVerificationApi as SrcApi, BlockpassPayload } from "@thecointech/broker-cad";
import { AxiosResponse } from 'axios';
import { buildResponse } from "../axios-utils";
export { StatusType };

const statii = [
  StatusType.Started,
  StatusType.Incomplete,
  StatusType.Waiting,
  StatusType.Inreview,
  StatusType.Approved,
  StatusType.Completed,
]
let status = StatusType.Started;
const incrementStatus = () => status = statii[statii.indexOf(status) + 1 % statii.length];

export class UserVerificationApi implements Pick<SrcApi, keyof SrcApi> {
  updateStatus(xHubSignature: string, payload: BlockpassPayload, options?: any): Promise<AxiosResponse<void>> {
    status = payload.status;
    return Promise.resolve(
      buildResponse(undefined as any) // not technically void, but meh
    );
  }
  userDeleteRaw(ts: string, sig: string, options?: any): Promise<AxiosResponse<void>> {
    status = StatusType.Completed;
    return Promise.resolve(
      buildResponse(undefined as any) // not technically void, but meh
    );
  }
  userGetData(ts: string, sig: string, options?: any): Promise<AxiosResponse<UserVerifyData>> {
    incrementStatus()
    return Promise.resolve(
      buildResponse({
        status,
        referralCode: null,
        raw: {
          status,
          identities: {
            given_name: { value: "Cookie" },
            family_name: { value: "Monster" },
            dob: {value: "1969/03/30" },
          }
        }
      } as any)
    );
  }
}
