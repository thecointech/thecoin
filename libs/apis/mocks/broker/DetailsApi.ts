import type { DetailsApi as SrcApi, DetailsResponse, EncryptedBlob } from "@thecointech/broker-cad";
import { AxiosResponse } from 'axios';
import { buildResponse } from "../axios-utils";
import { getKycState } from "./kycState";

// In-memory store; the blob is opaque to us anyway
let preferences: EncryptedBlob | null = null;
let writes = 0;

export class DetailsApi implements Pick<SrcApi, keyof SrcApi> {
  getDetails(_ts: string, _sig: string, _options?: any): Promise<AxiosResponse<DetailsResponse>> {
    const kyc = getKycState();
    return Promise.resolve(
      buildResponse({
        basic: {
          kycStage: kyc.kycStage,
          kycUpdated: kyc.statusUpdated,
          referralStatus: kyc.referralStatus,
          referralCode: kyc.referralCode,
        },
        preferences,
      } as DetailsResponse)
    );
  }
  putDetails(_ts: string, _sig: string, blob: EncryptedBlob, _options?: any): Promise<AxiosResponse<any>> {
    preferences = blob;
    writes++;
    return Promise.resolve(
      buildResponse({ success: true })
    );
  }
}
