import type { BlockpassStatus } from '@thecointech/blockpass/types'

// Start moving types out of types project to where they are used.

export interface ErrorResponse {
  error: string;
}
export interface ETransferCodeResponse {
  code: string;
}
export interface CertifiedTransferResponse {
  message: string;
  state?: string;
  hash?: string;
}

type EventType =
  "user.created"|
  "user.readyToReview"|
  "review.approved"|
  "user.inReview"|
  "review.rejected" |
  "user.blocked"

export type BlockpassPayload = {
  guid: string,
  // current user status
  status: BlockpassStatus,
  // Id of the service as defined in the Admin Console
  clientId: string,
  // Event that triggered the webhook
  event: EventType,
  // Id of user in the KYC dashboard. Can be used to generate url to the profile
  // i.e. https://kyc.blockpass.org/kyc/dashboard/#/<clientId>/kyc_detail/<recordId>
  recordId: string,
  // refId set in the widget. Can be used as cross-reference with an external database
  // This should be the users eth address
  refId: string,
  // Number of times the user submitted the profile to the KYC dashboard
  submitCount?: number,
  // ID to share with the Blockpass support to find specific users
  blockPassID?: string,
  // Takes 1 if profile is archived in the KYC dashboard. 0 otherwise.
  isArchived?: boolean,
  // Timestamp of last review of the profile
  inreviewDate?: string,
  // Timestamp of last profile submission
  waitingDate?: string,
  // Timestamp of the last approval of the profile
  approvedDate?: string,
  // Used to debug a newly created webhook, can be ignored.
  isPing?: boolean,
  // should be 'prod'
  env?: "prod",
}
