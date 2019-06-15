import { ethers, Wallet } from "ethers";
import { BrokerCAD } from "@the-coin/types/lib/BrokerCAD";

// ---------------------------------------------------------\\

function GetHash(
  from: string,
  to: string,
  value: number,
  fee: number,
  timestamp: number
) {
  const ethersHash = ethers.utils.solidityKeccak256(
    ["address", "address", "uint256", "uint256", "uint256"],
    [from, to, value, fee, timestamp]
  );
  return ethers.utils.arrayify(ethersHash);
}

export async function SignVerifiedXfer(
  from: Wallet,
  to: string,
  value: number,
  fee: number,
  timestamp: number
) {
  const hash = GetHash(from.address, to, value, fee, timestamp);
  return await from.signMessage(hash);
}

export function GetTransferSigner(
  transfer: BrokerCAD.CertifiedTransferRequest
) {
  const { from, to, value, fee, timestamp, signature } = transfer;
  const hash = GetHash(from, to, value, fee, timestamp);
  return ethers.utils.verifyMessage(hash, signature);
}

/// Build the structure to be passed to the coin servers
/// Build the CertifiedTransferRequest
export async function BuildVerifiedXfer(
  from: Wallet,
  to: string,
  value: number,
  fee: number
) {
  const timestamp = Date.now();
  const signature = await SignVerifiedXfer(from, to, value, fee, timestamp);
  const r: BrokerCAD.CertifiedTransferRequest = {
    from: from.address,
    to: to,
    value: value,
    fee: fee,
    timestamp: timestamp,
    signature: signature
  };
  return r;
}
