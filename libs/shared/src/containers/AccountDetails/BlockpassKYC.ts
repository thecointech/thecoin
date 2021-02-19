
// Basic type for the data returned from blockpass.
// Sample from: https://docs.blockpass.org/docs/connect/KYCC-Dashboard-API-RefId#response-1
// TODO: this has not yet been verified with live data
export type BlockpassKYC = {

  status: string; //"inreview",
  refId: string; // or number? "1",
  isArchived: boolean; // false,
  blockPassID: string; // "5be95a995f8c44000e972445",
  inreviewDate: string; // "2018-11-12T10:49:17.973Z",
  waitingDate: string; // "2018-11-12T10:49:03.017Z",
  customFields: {
      RiskLevel: string; // "Low"
  },
  identities: {
    address: {
      type: string; // "string",
      value: string; // "{\"postalCode\":\"62576-6471\",\"city\":\"Luettgenchester\",\"address\":\"4611 Zieme Knoll\",\"extraInfo\":\"extra\",\"country\":\"VNM\",\"state\":\"\"}"
    },
    dob: {
      type: string; // "string",
      value: string; // "12/31/2016"
    },
    email: {
      type: string; // "string",
      value: string; // "52777-50830-Alexandre42@yahoo.com"
    },
    family_name: {
      type: string; // "string",
      value: string; // "StromanBot"
    },
    given_name: {
      type: string; // "string",
      value: string; // "Helmer"
    },
    phone: {
      type: string; // "string",
      value: string; // "{\"countryCode\":\"VNM\",\"countryCode2\":\"vn\",\"phoneNumber\":\"+84987543212\",\"number\":\"987543212\"}"
    },
    selfie_national_id: {
      type: string; // "base64",
      value: string; // "/9j/4AAQSkZJRgABAQEASABIAAD/<...>"
    },
    proof_of_address: {
      type: string; // "base64",
      value: string; // "/9j/4AAQSkZJRgABAQEASABI<...>"
    },
    selfie: {
      type: string; // "base64",
      value: string; // "/9j/4AAQSkZJRgABAQEA<...>"
    },
    passport: {
      type: string; // "base64",
      value: string; // "/9j/4AAQSkZJ<...>"
    }
  },
  certs: {
    ["onfidoservice-cert"]: string; // "{\"@context\":[{\"@version\":1.1},,<...>",
    ["complyadvantageservice-cert"]: string; // "{\"@context\":[{\"@version\":1.1},<...>"
  }
}

// The stored/passed data.  This must always be kept in string
// form to ensure that signatures match.
export type SerializedKYC = {
  // The serialized BlockpassKYC data.  This is of
  // type BlockpassKYC, but stored in string form to be deterministic
  data: string;
  signature?: string;
}
