import { BlockpassData, StatusType as SrcType, UserVerificationApi as SrcApi } from "@thecointech/broker-cad";
import { AxiosResponse } from 'axios';
import { buildResponse } from "../axios-utils";


export enum StatusType // Should match SrcType exactly
{
  Started = "started",
  Incomplete = "incomplete",
  Waiting = "waiting",
  Approved = "approved",
  Inreview = "inreview",
  Rejected = "rejected",
  Completed = "completed"
}
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
  userDeleteRaw(ts: string, sig: string, options?: any): Promise<AxiosResponse<void>> {
    status = StatusType.Completed;
    return Promise.resolve(
      buildResponse(undefined as any) // not technically void, but meh
    );
  }
  userPullData(ts: string, sig: string, options?: any): Promise<AxiosResponse<BlockpassData>> {
    return Promise.resolve(
      buildResponse({
        status,
        identities: {
          given_name: { value: "Cookie" },
          family_name: { value: "Monster" },
          dob: {value: "1969/03/30" },
        }
      } as any)
    );
  }
  userVerifyStatus(ts: string, sig: string, options?: any): Promise<AxiosResponse<SrcType>> {
    // Every pull, we increment the type
    if (status != StatusType.Completed) {
      incrementStatus();
    }
    return Promise.resolve(
      buildResponse(status)
    );
  }


}
