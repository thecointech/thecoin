import { sign } from "./SignedMessages";
import { keccak256 } from '@ethersproject/solidity';
import { arrayify } from '@ethersproject/bytes';
import { verifyMessage } from '@ethersproject/wallet';
import type { Signer } from "@ethersproject/abstract-signer";
import type { AnyTransfer, CertifiedTransferRequest } from "@thecointech/types";

function GetHash(
  chainId: number,
  from: string,
  to: string,
  value: number,
  fee: number,
  timestamp: number
) {
  const ethersHash = keccak256(
    ["uint", "address", "address", "uint256", "uint256", "uint256"],
    [chainId, from, to, value, fee, timestamp]
  );
  return arrayify(ethersHash);
}

export async function SignVerifiedXfer(
  chainId: number,
  from: Signer,
  to: string,
  value: number,
  fee: number,
  timestamp: number
) {
  const address = await from.getAddress();
  const hash = GetHash(chainId, address, to, value, fee, timestamp);
  return await sign(hash, from);
}

export function GetTransferSigner(
  transfer: CertifiedTransferRequest
) {
  const { chainId, from, to, value, fee, timestamp, signature } = transfer;
  const hash = GetHash(chainId, from, to, value, fee, timestamp);
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
  const chainId = parseInt(process.env.DEPLOY_POLYGON_NETWORK_ID!);
  const timestamp = Date.now();
  const address = await from.getAddress();
  const signature = await SignVerifiedXfer(chainId, from, to, value, fee, timestamp);
  const r: CertifiedTransferRequest = {
    chainId,
    from: address,
    to: to,
    value: value,
    fee: fee,
    timestamp: timestamp,
    signature: signature
  };
  return r;
}

export const isCertTransfer = (transfer: AnyTransfer): transfer is CertifiedTransferRequest => (
  typeof (transfer as CertifiedTransferRequest).chainId == "number" &&
  typeof (transfer as CertifiedTransferRequest).from == "string" &&
  typeof (transfer as CertifiedTransferRequest).to == "string" &&
  typeof (transfer as CertifiedTransferRequest).fee == "number" &&
  typeof (transfer as CertifiedTransferRequest).value == 'number' &&
  typeof (transfer as CertifiedTransferRequest).timestamp == "number" &&
  typeof (transfer as CertifiedTransferRequest).signature == "string"
)
