import type { EncryptedBlob } from "./types";

export type KycRecord = {
  provider: "blockpass";
  version: 1;          // bump if our handling of the raw shape changes
  data: EncryptedBlob; // encrypted version of BlockpassData
}
