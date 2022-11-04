import { sign } from "@thecointech/utilities/SignedMessages";
import { keccak256 } from '@ethersproject/solidity';
import { arrayify } from '@ethersproject/bytes';
import { verifyMessage } from '@ethersproject/wallet';
import type Decimal from 'decimal.js-light';
import type { Signer } from "@ethersproject/abstract-signer";
import { DateTime } from 'luxon';


export type UberTransfer = {
  from: string,
  to: string,
  amount: number,
  currency: number,
  transferTime: number,
  signedTime: number,
  signature: string,
}

function getHash(
  from: string,
  to: string,
  amount: number,
  currency: number,
  transferTime: number,
  signedTime: number,
) {
  const ethersHash = keccak256(
    ["address", "address", "uint", "uint16", "uint", "uint"],
    [from, to, amount, currency, transferTime, signedTime]
  );
  return arrayify(ethersHash);
}

export async function signUberTransfer(
  from: Signer,
  to: string,
  amount: number,
  currency: number,
  transferTime: number,
  signedTime: number,
) {
  const address = await from.getAddress();
  const hash = getHash(address, to, amount, currency, transferTime, signedTime);
  return await sign(hash, from);
}

export function getTransferSigner(
  transfer: UberTransfer
) {
  const { from, to, amount, currency, transferTime, signedTime, signature } = transfer;
  const hash = getHash(from, to, amount, currency, transferTime, signedTime);
  return verifyMessage(hash, signature);
}

/// Build the structure to be passed to the coin servers
export async function buildUberTransfer(
  from: Signer,
  to: string,
  amount: Decimal,
  currency: number,
  transferTime: DateTime,
  signedTime: DateTime,
) {
  const address = await from.getAddress();
  const transferSeconds = Math.round(transferTime.toSeconds());
  const signedSeconds = Math.round(signedTime.toSeconds());
  const amountAdj = amount.mul(100).toInteger().toNumber();
  const signature = await signUberTransfer(from, to, amountAdj, currency, transferSeconds, signedSeconds);
  const r: UberTransfer = {
    from: address,
    to,
    amount: amountAdj,
    currency,
    transferTime: transferSeconds,
    signedTime: signedSeconds,
    signature,
  };
  return r;
}
