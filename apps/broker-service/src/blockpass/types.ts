import { StatusType } from '@thecointech/broker-db/user.types'

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
  submitCount: number,
  // ID to share with the Blockpass support to find specific users
  blockPassID: string,
  // Takes 1 if profile is archived in the KYC dashboard. 0 otherwise.
  isArchived: boolean,
  // Timestamp of last review of the profile
  inreviewDate?: string,
  // Timestamp of last profile submission
  waitingDate?: string,
  // Timestamp of the last approval of the profile
  approvedDate?: string,
  // Used to debug a newly created webhook, can be ignored.
  isPing: boolean,
  // should be 'prod'
  env: "prod",
}

export type BlockpassData = {
  status: string; //"success",
  data: {
    status: StatusType,
    refId: string,
    isArchived: false,
    blockPassID: string,
    inreviewDate: string,
    waitingDate: string,
    customFields: {
      RiskLevel: string, // "Low"
    },
    identities: {
      address: {
        type: string; // "string",
        value: string; //"{\"postalCode\":\"62576-6471\",\"city\":\"Luettgenchester\",\"address\":\"4611 Zieme Knoll\",\"extraInfo\":\"extra\",\"country\":\"VNM\",\"state\":\"\"}"
      },
      dob: {
        type: string; //"string",
        value: string; // "12/31/2016"
      },
      email: {
        type: string; //"string",
        value: string; //"52777-50830-Alexandre42@yahoo.com"
      },
      family_name: {
        type: string; //"string",
        value: string; //"StromanBot"
      },
      given_name: {
        type: string; //"string",
        value: string; //"Helmer"
      },
      phone: {
        type: string; //"string",
        value: string; //"{\"countryCode\":\"VNM\",\"countryCode2\":\"vn\",\"phoneNumber\":\"+84987543212\",\"number\":\"987543212\"}"
      },
      selfie_national_id?: {
        type: string; //"base64",
        value: string; //"/9j/4AAQSkZJRgABAQEASABIAAD/<...>"
      },
      proof_of_address?: {
        type: string; //"base64",
        value: string; //"/9j/4AAQSkZJRgABAQEASABI<...>"
      },
      selfie: {
        type: string; //"base64",
        value: string; //"/9j/4AAQSkZJRgABAQEA<...>"
      },
      passport?: {
        type: string; //"base64",
        value: string; //"/9j/4AAQSkZJ<...>"
      }
    },
    // Issuer => JSON-as-string mapping
    certs: Record<string, string>
  }
}
