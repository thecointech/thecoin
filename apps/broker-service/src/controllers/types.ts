import { StatusType } from '@thecointech/broker-db/user.types'

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
  status: StatusType,
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

export type TypedData = {
  type: string;
  value: string;
}

// NOTE: Mocked entry was deleted in Commit: #108c21b38993745e16056ea8d5a38c5cb81136a5
// Basic type for the data returned from blockpass.
// Sample from: https://docs.blockpass.org/docs/connect/KYCC-Dashboard-API-RefId#response-1
// TODO: this has not yet been verified with live data
export type BlockpassData = {
  status: StatusType,
  refId: string,
  isArchived: boolean,
  blockPassID: string,
  inreviewDate: string,
  waitingDate: string,
  customFields: {
    RiskLevel: string, // "Low"
  },
  identities: {
    // "{\"postalCode\":\"62576-6471\",\"city\":\"Luettgenchester\",\"address\":\"4611 Zieme Knoll\",\"extraInfo\":\"extra\",\"country\":\"VNM\",\"state\":\"\"}"
    address?: TypedData;
    // "12/31/2016"
    dob: TypedData;
    // "52777-50830-Alexandre42@yahoo.com"
    email?: TypedData;
    // "StromanBot"
    family_name: TypedData,
    // "Helmer"
    given_name: TypedData,
    // "{\"countryCode\":\"VNM\",\"countryCode2\":\"vn\",\"phoneNumber\":\"+84987543212\",\"number\":\"987543212\"}"
    phone?: TypedData,
    // "/9j/4AAQSkZJRgABAQEASABIAAD/<...>"
    selfie_national_id?: TypedData,
    // "/9j/4AAQSkZJRgABAQEASABI<...>"
    proof_of_address?: TypedData,
    // "/9j/4AAQSkZJRgABAQEA<...>"
    driving_license?: TypedData,
    driving_license_dob?: TypedData,
    driving_license_expiration?: TypedData,
    driving_license_issuing_country?: TypedData,
    driving_license_number?: TypedData,

    // "/9j/4AAQSkZJRgABAQEA<...>"
    selfie?: TypedData,
    // "/9j/4AAQSkZJ<...>"
    passport?: TypedData,
  }
  // Issuer => JSON-as-string mapping
  certs: any
}

// A small sub-set of the data stored on firestore (UserVerifyInfo)
export type UserVerifyData ={
  status?: StatusType,
  referralCode?: string,
  raw?: BlockpassData,
  uniqueIdSig?: string,
}
