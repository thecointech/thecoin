import { sign } from "./SignedMessages";
import { keccak256 } from '@ethersproject/solidity';
import { arrayify } from '@ethersproject/bytes';
import { verifyMessage } from '@ethersproject/wallet';
import type Decimal from 'decimal.js-light';
import type { Signer } from "@ethersproject/abstract-signer";
import type { AnyTransfer, UberTransfer } from "@thecointech/types";
import { DateTime } from 'luxon';

function getHash(
  chainId: number,
  from: string,
  to: string,
  amount: number,
  currency: number,
  transferTime: number,
  signedTime: number,
) {
  const ethersHash = keccak256(
    ["uint", "address", "address", "uint", "uint16", "uint", "uint"],
    [chainId, from, to, amount, currency, transferTime, signedTime]
  );
  return arrayify(ethersHash);
}

export async function signUberTransfer(
  chainId: number,
  from: Signer,
  to: string,
  amount: number,
  currency: number,
  transferTime: number,
  signedTime: number,
) {
  const address = await from.getAddress();
  const hash = getHash(chainId, address, to, amount, currency, transferTime, signedTime);
  return await sign(hash, from);
}

export function getTransferSigner(
  transfer: UberTransfer
) {
  const { chainId, from, to, amount, currency, transferMillis, signedMillis, signature } = transfer;
  const hash = getHash(chainId, from, to, amount, currency, transferMillis, signedMillis);
  return verifyMessage(hash, signature);
}

/// Build the structure to be passed to the coin servers
export async function buildUberTransfer(
  from: Signer,
  to: string,
  amount: Decimal,
  currency: number,
  transferTime: DateTime,
) {
  // We only run on the polygon network for now...
  const chainId = parseInt(process.env.DEPLOY_POLYGON_NETWORK_ID!);
  const signedTime = DateTime.now();
  const address = await from.getAddress();
  const transferMillis = transferTime.toMillis();
  const signedMillis = signedTime.toMillis();
  const amountAdj = amount.mul(100).toInteger().toNumber();
  const signature = await signUberTransfer(chainId, from, to, amountAdj, currency, transferMillis, signedMillis);
  const r: UberTransfer = {
    chainId,
    from: address,
    to,
    amount: amountAdj,
    currency,
    transferMillis,
    signedMillis,
    signature,
  };
  return r;
}

export const isUberTransfer = (transfer: AnyTransfer): transfer is UberTransfer => (
  typeof (transfer as UberTransfer).chainId == "number" &&
  typeof (transfer as UberTransfer).from == "string" &&
  typeof (transfer as UberTransfer).to == "string" &&
  typeof (transfer as UberTransfer).amount == "number" &&
  typeof (transfer as UberTransfer).currency == 'number' &&
  typeof (transfer as UberTransfer).transferMillis == "number" &&
  typeof (transfer as UberTransfer).signedMillis == "number" &&
  typeof (transfer as UberTransfer).signature == "string"
)
