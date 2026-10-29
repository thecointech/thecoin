import { EncryptedBlob } from "./types";

export type StatusType =
  "started"| // Button clicked in UI.  Starts polling
  "incomplete"| // Submission started, but not finished
  "waiting"| // Submission uploaded to BP
  "approved"| // Approved within BP
  "inreview"|
  "rejected";


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

export type KycRecord = {
  provider: "blockpass";
  version: 1;          // bump if our handling of the raw shape changes
  data: EncryptedBlob; // best-guess, unverified against live data
}
