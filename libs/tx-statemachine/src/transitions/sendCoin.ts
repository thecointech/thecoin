import { log } from "@thecointech/logging";
import { Decimal } from "decimal.js-light";
import { AnyActionContainer, getCurrentState, TransitionCallback } from "../types";
import { verifyPreTransfer } from "./verifyPreTransfer";
import { DateTime } from "luxon";
import { toCoin } from "./toCoin";
import { convertBN, toDelta } from './coinUtils';
import { last } from '@thecointech/utilities';
import { BigNumber } from '@ethersproject/bignumber';
import type { TheCoin } from '@thecointech/contract-core';
import type { Overrides } from '@ethersproject/contracts';
import type { Transaction } from '@ethersproject/transactions';

// It does not seem that any transactions submitted with less then 30Gwei are accepted
const MinimumBloodsuckerFee = 30 * Math.pow(10, 9);
//
// Send the current balance to the client.  If successful,
// this will reset the coin balance to 0
export async function sendCoin(container: AnyActionContainer) {
  return verifyPreTransfer(container) ?? await doSendCoin(container);
}

// implementation
const doSendCoin: TransitionCallback = async (container) => {
  const currentState = getCurrentState(container);
  if (!currentState.data.coin?.isPositive()) {
    return { error: 'Cannot send coin, state has no value' }
  }

  const overrides = await calculateOverrides(container);
  const settledDate = findSettledDate(container);
  var tx = await startTheTransfer(container.action.address, currentState.data.coin, settledDate, container.contract, overrides);

  // We only start the transfer (do not wait for completion).
  // If completion is required add 'waitCoin' transition.
  return toDelta(tx);
}

async function startTheTransfer(address: string, value: Decimal, settled: DateTime, contract: TheCoin, overrides: Overrides)
{
  log.debug({address}, `Transfering ${value.toString()} to {address} with overrides ${JSON.stringify(overrides, convertBN)}`);
  return contract.exactTransfer(
    address,
    value.toNumber(),
    settled.toMillis(),
    overrides
  );
}

function findSettledDate(container: AnyActionContainer) {
  const settlements = container.history.filter(t => t.delta.type == toCoin.name);
  return last(settlements)?.delta.date ?? container.action.data.date;
}

// If we have prior, the tx failed for whatever reason and we now need to
// replace it (ie, jack up the bribe)
async function calculateOverrides(container: AnyActionContainer) : Promise<Overrides> {
  const prior = findPriorAttempt(container);
  const nonce = await getNonce(container, prior);
  const fees = await getOverrideFees(container, prior)
  return {
    nonce,
    ...fees,
  };
}

// Find the latest (reportedly) successful attempt
function findPriorAttempt(container: AnyActionContainer) {
  const attempts = container.history.filter(t => (t.delta.type == sendCoin.name) && (!t.delta.error));
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

async function getNonce(container: AnyActionContainer, prior?: Transaction) {
  if (prior?.nonce) return prior.nonce;
  const address = await container.contract.signer.getAddress();
  return await container.contract.provider.getTransactionCount(address)
}
