import type { StatusType, ReferralStatus, BlockpassPayload } from "@thecointech/broker-cad";

//
// Shared state connecting the mock webhook (UserVerificationApi)
// with the mock details endpoint (DetailsApi), emulating the
// broker-service DB in development mode.
//
type MockKycState = {
  status?: StatusType;
  statusUpdated?: number;
  referralStatus?: ReferralStatus;
  referralCode?: string;
  payload?: BlockpassPayload;
};

let state: MockKycState = {};

export const getKycState = (): MockKycState => state;

export function updateKyc(payload: BlockpassPayload) {
  const status = payload.status as StatusType;
  state = { ...state, status, statusUpdated: Date.now(), payload };

  // On approval, emulate tx-processor picking up the
  // pending referral and assigning a code shortly after.
  if (status === "approved") {
    state.referralStatus = "pending";
    state.referralCode = undefined;
    setTimeout(() => {
      state.referralStatus = "assigned";
      state.referralCode = "MOCKCODE";
    }, 3000);
  }
}
