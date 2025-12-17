import Crypto from "crypto";
import { CertifiedTransferRequest, UberTransfer } from "@thecointech/types";
import { getBytes, solidityPackedKeccak256 } from 'ethers';
import { getSecret } from "@thecointech/secrets";
import type { EncryptedPacket } from "./Encrypt";


export function decrypt(privateKey: string, value: string) {
    const buffer = Buffer.from(value, "base64");
    const output = Crypto.privateDecrypt(privateKey, buffer);
    return output.toString();
  }
  
  export async function decryptTo<T>(encrypted: EncryptedPacket): Promise<T|null>
  {
    // NOTE: server does not have private key, and will not pass this step
    // TODO!!!! Validate server behaves correctly!
    const privateKey = await getSecret("UserDataInstructionKeyPrivate")
    const asString = decrypt(privateKey, encrypted.encryptedPacket);
    return JSON.parse(asString) as T;
  }
  
  export function GetHash(
    encryptedPayee: EncryptedPacket,
    transfer: CertifiedTransferRequest|UberTransfer
  ) {
    return getBytes(
      solidityPackedKeccak256(
        ["string", "string", "string"],
        [
          transfer.signature,
          encryptedPayee.encryptedPacket,
          encryptedPayee.version
        ]
      )
    );
  }
  