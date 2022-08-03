import { sign } from "./SignedMessages";
import { keccak256 } from '@ethersproject/solidity';
import { arrayify } from '@ethersproject/bytes';
import { verifyMessage } from '@ethersproject/wallet';
import type { Signer } from "@ethersproject/abstract-signer";
import type { CertifiedTransferRequest } from "@thecointech/types";

function GetHash(
  from: string,
  to: string,
  value: number,
  fee: number,
  timestamp: number
) {
  const ethersHash = keccak256(
    ["address", "address", "uint256", "uint256", "uint256"],
    [from, to, value, fee, timestamp]
  );
  return arrayify(ethersHash);
}

export async function SignVerifiedXfer(
  from: Signer,
  to: string,
  value: number,
  fee: number,
  timestamp: number
) {
  const address = await from.getAddress();
  const hash = GetHash(address, to, value, fee, timestamp);
  return await sign(hash, from);
}

export function GetTransferSigner(
  transfer: CertifiedTransferRequest
) {
  const { from, to, value, fee, timestamp, signature } = transfer;
  const hash = GetHash(from, to, value, fee, timestamp);
  return verifyMessage(hash, signature);
}

/// Build the structure to be passed to the coin servers
/// Build the CertifiedTransferRequest
export async function BuildVerifiedXfer(
  from: Signer,
  to: string,
  value: number,
  fee: number
) {
  const timestamp = Date.now();
  const address = await from.getAddress();
  const signature = await SignVerifiedXfer(from, to, value, fee, timestamp);
  const r: CertifiedTransferRequest = {
    from: address,
    to: to,
    value: value,
    fee: fee,
    timestamp: timestamp,
    signature: signature
  };
  return r;
}
