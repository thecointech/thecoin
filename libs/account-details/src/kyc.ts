import { computeAddress } from "ethers";
import { encryptObject, decryptObject } from "./crypto";
import { toSerializable, fromSerializable } from "./serialize";
import type { KycRecord } from "./types";
import type { BlockpassData } from "@thecointech/blockpass/types";

// KYC records are encrypted to BrokerCAD only: the user never reads them.
export async function encryptKyc(kyc: BlockpassData, brokerPubKey: string): Promise<KycRecord> {
  const data = await encryptObject(toSerializable(kyc), [{
    address: computeAddress(brokerPubKey),
    pubKey: brokerPubKey,
  }]);
  return {
    provider: "blockpass",
    version: 1,
    data: data,
  };
}

export async function decryptKyc(blob: KycRecord, brokerPrivateKey: string): Promise<BlockpassData> {
  if (blob.provider !== "blockpass" || blob.version !== 1) {
    throw new Error("Unsupported KYC provider or version");
  }
  return fromSerializable(await decryptObject(blob.data, brokerPrivateKey)) as BlockpassData;
}
