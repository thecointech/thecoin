import { TransactionResponse } from "ethers";
import { BigNumber } from 'ethers';
import { log } from '@thecointech/logging';
import { AnyActionContainer, NamedTransition } from '../types';
import { last } from '@thecointech/utilities';
import type { Overrides } from 'ethers';
import type { Transaction } from 'ethers';
import { ActionType } from "@thecointech/broker-db";

// It does not seem that any transactions submitted with less then 30Gwei are accepted
const MinimumBloodsuckerFee = 30 * Math.pow(10, 9);

// Don't log the actual transaction details
export const ignoredTxParams = ["data", "value", "accessList", "raw", "r", "s", "v"];
export const convertBN = (key: string, val: any) => (
  ignoredTxParams.includes(key) || !val
    ? undefined
    : (val.type == "BigNumber" && val.hex)
      ? BigNumber.from(val.hex).toNumber()
      : val
);

export const toDelta = (tx: TransactionResponse) => {
  if (!tx.hash) return {
    error: "Missing transaction hash",
    hash: undefined,
  }

  try {
    return {
      hash: tx.hash,
      meta: JSON.stringify(tx, convertBN),
    }
  } catch(e: any) {
    log.error(e, `Error converting {hash}`, {hash: tx.hash});
    return {
      error: e.message ?? e.toString(),
      hash: undefined,
    }
  }
}

// If we have prior, the tx failed for whatever reason and we now need to
// replace it (ie, jack up the bribe)
export async function calculateOverrides<Type extends ActionType=ActionType>(container: AnyActionContainer, transition: NamedTransition<Type>) : Promise<Overrides> {
  const prior = findPriorAttempt(container, transition);
  const nonce = await getNonce(prior);
  const fees = await getOverrideFees(container, prior)
  return {
    nonce,
    ...fees,
  };
}

// Find the latest (reportedly) successful attempt
function findPriorAttempt<Type extends ActionType=ActionType>(container: AnyActionContainer, transition: NamedTransition<Type>) {
  const attempts = container.history.filter(t => (t.delta.type == transition.transitionName) && (!t.delta.error));
  const prior = last(attempts);
  if (prior?.delta.meta) {
    try {
      const priorTx = JSON.parse(prior.delta.meta);
      const nonce = Number(priorTx.nonce);
      const maxFeePerGas = BigNumber.from(priorTx.maxFeePerGas);
      const maxPriorityFeePerGas = BigNumber.from(priorTx.maxPriorityFeePerGas);
      if (!isNaN(nonce) && maxFeePerGas.gt(0) && maxPriorityFeePerGas.gt(0)) {
        log.debug({hash: priorTx.hash}, "Found prior tx {hash}");
        return priorTx;
      }
    }
    catch {}
  }
  return undefined;
}

async function getOverrideFees(container: AnyActionContainer, prior?: Transaction) {
  const fees = await container.contract.provider.getFeeData();
  log.debug(`Current Fees: ${JSON.stringify(fees, convertBN)}`);
  if (!fees.maxFeePerGas || !fees.maxPriorityFeePerGas) return undefined;

  // calculate new maximums at least 10% higher than previously
  const base = fees.maxFeePerGas.sub(fees.maxPriorityFeePerGas);
  const priorTip = prior?.maxPriorityFeePerGas?.toNumber();
  const newMinimumTip = priorTip ? Math.floor(priorTip * 1.1) : MinimumBloodsuckerFee;
  const tip = Math.max(fees.maxPriorityFeePerGas.toNumber(), newMinimumTip);
  return {
    maxFeePerGas: base.mul(2).add(tip),
    maxPriorityFeePerGas: BigNumber.from(tip),
  }
}

async function getNonce(prior?: Transaction) {
  if (prior?.nonce) return prior.nonce;
  // DO NOT SET AN EXPLICIT NONCE!!!  The contract running in GAE may submit
  // simultaneous transactions uses a DB-based lock to ensure in-order
  // submission
  return undefined;
}
