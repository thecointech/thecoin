import type { ReferralStatus, BlockpassPayload, BlockpassStatus, KycStage } from "@thecointech/broker-cad";

//
// Shared state connecting the mock webhook (UserVerificationApi)
// with the mock details endpoint (DetailsApi), emulating the
// broker-service DB in development mode.
//
type MockKycState = {
  blockpassStatus?: BlockpassStatus;
  kycStage?: KycStage;
  statusUpdated?: number;
  referralStatus?: ReferralStatus;
  referralCode?: string;
  payload?: BlockpassPayload;
};

let state: MockKycState = {};

export const getKycState = (): MockKycState => state;

// Mirror kycStageFromBlockpassStatus in broker-service/verify:
// the client reads kycStage, not the raw Blockpass status.
function stageFromStatus(status: BlockpassStatus): KycStage {
  switch (status) {
    case "started":
    case "incomplete": return "started";
    case "waiting":
    case "inreview": return "reviewing";
    case "approved": return "complete";
    case "rejected": return "rejected";
    default: return "reviewing";
  }
}

export function updateKyc(payload: BlockpassPayload) {
  const status = payload.status;
  state = {
    ...state,
    blockpassStatus: status,
    kycStage: stageFromStatus(status),
    statusUpdated: Date.now(),
    payload,
  };

  // On approval, emulate tx-processor picking up the
  // pending referral and assigning a code shortly after.
  if (status === "approved") {
    state.referralStatus = "pending";
    state.referralCode = undefined;
    setTimeout(() => {
      state.referralStatus = "active";
      state.referralCode = "MOCKCODE";
    }, 3000);
  }
}
