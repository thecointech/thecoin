import { log } from '@thecointech/logging';
import { SpxCadOracle } from './types';
import { BigNumber } from '@ethersproject/bignumber';

type RateFactory = (millis: number) => Promise<{rate: number, from: number, to: number}|null>;

const MAX_LENGTH = 1000;
const ONE_HR = 1000 * 60 * 60;

export async function updateRates(oracle: SpxCadOracle, till: number, rateFactory: RateFactory) {

  const factor = Math.pow(10, await oracle.decimals());
  const from = (await oracle.validUntil()).toNumber();
  const blockTime = (await oracle.BLOCK_TIME()).toNumber();
  const lastOffsetFrom = (await oracle.lastOffsetFrom()).toNumber();
  let priorOffset = (await oracle.getOffset(from)).toNumber();
  let timestamp = from;

  log.info(
    { from: new Date(from), till: new Date(till) },
    'Updating Oracle from {from} to ${till}'
  );

  // Not an application error, but we should never be this far out of date
  const hoursToUpdate = (till - from) / ONE_HR;
  if (hoursToUpdate > 24 && !process.env.JEST_WORKER_ID) {
    log.warn({hours: hoursToUpdate}, "Oracle is {hours}hrs out-of-date");
  }

  const rates: number[] = [];
  const offsets: {from: number, offset: number}[] = [];
  while (timestamp < till) {
    const r = await rateFactory(timestamp);
    if (!r) {
      log.trace("No rate for timestamp", {timestamp});
      break;
    }

    // rates have 8 decimal points
    let rate = Math.round(r.rate * factor);
    // How long was the prior block  valid for?
    let to = r.to;
    let duration = to - timestamp;

    // We explicitly add duplicates.  This is because
    // our oracle is optimized for look-up by using a
    // consistent duration for every time block
    while ((rates.length + 1) * blockTime < to - from) {
    // while (duration >= (1.5 * blockTime)) {
      rates.push(rate);
      duration -= blockTime;
      timestamp += blockTime;
    }

    // This rate should take us up to (and possibly past)
    // the blocktime boundary.
    rates.push(rate);
    timestamp += blockTime;

    log.debug(
      { timestamp, length: rates.length },
      '{length} rates fetched reaches {timestamp}'
    )

    // If not 3 hours in length, we use the offset to
    // shorten/lengthen the current block
    if (duration != blockTime) {
      const newOffset = (priorOffset + (duration - blockTime)) % blockTime;
      if (Math.abs(newOffset % (ONE_HR)) != 0) {
        log.error("Offset is not a multiple of one hour", {timestamp, newOffset});
      }
      offsets.push({
        from: to - duration,
        offset: newOffset,
      });
      timestamp += (newOffset - priorOffset);
      priorOffset = newOffset;
    }
  }

  log.info(
    { timestamp, length: rates.length, date: new Date(timestamp) },
    "Completed fetch with {length} new rates reaching {timestamp} - {date}"
  )

  // We have pushed too many rates repeatedly, so double-check here
  const doubleCheckValidUntil = from + (rates.length * blockTime);
  if (doubleCheckValidUntil > (Date.now() + 5 * ONE_HR)) {
    log.fatal({ expiry: new Date(doubleCheckValidUntil) }, "Too many rates, calculated expiry is {expiry}");
    return false;
  }

  try {

    // If we have offsets, push them to the oracle first.
    // this is because if any of these calls fail, the rates
    // can be recalculated from anywhere but only if the
    // offsets have been set appropriately.
    for (const offset of offsets) {
      if (offset.from <= lastOffsetFrom) {
        log.debug("Skipping existing offset");
        continue;
      }
      const overrides = await getOverrideFees(oracle);
      log.trace(`Pushing new Offset ${offset.offset / ONE_HR}hrs at ${new Date(offset.from)}`);
      const tx = await oracle.updateOffset(offset, overrides);
      log.debug(`Waiting offset: ${tx.hash}`)
      await tx.wait(2);
    }

    // If we have enough rates, push them to the oracle
    if (rates.length == 1) {
      // The majority of time, we only have one rate to push
      // So use this function, as it's a wee bit cheaper than the below
      const overrides = await getOverrideFees(oracle);
      const tx = await oracle.update(rates[0], overrides);
      log.info(`Waiting single insert: ${tx.hash}`)
      await tx.wait(2);
    }
    else if (rates.length > 1) {
      for (let s = 0; s < rates.length; s += MAX_LENGTH) {
        log.trace(`Updating rates: ${s} of ${rates.length}`);
        const e = Math.min(s + MAX_LENGTH, rates.length);
        const overrides = await getOverrideFees(oracle);
        const tx = await oracle.bulkUpdate(rates.slice(s, e), overrides);
        log.info(`Waiting bulk insert: ${tx.hash}`)
        await tx.wait(2);
      }
    }
    log.trace(`Updated ${rates.length} new rates, until ${timestamp} : ${new Date(timestamp)}`)

    const newLatest = (await oracle.validUntil()).toNumber();
    log.trace(`New contract latest: ${new Date(newLatest)}`);
  }
  catch (err: any) {
    log.error(err, "Error updating oracle");
    // await SendMail("Error updating oracle", err.message);
    throw err;
  }

  return true;
}

// Dup 3x, must be refactored
const MinimumBloodsuckerFee = 30 * Math.pow(10, 9);

async function getOverrideFees(oracle: SpxCadOracle) {
  const fees = await oracle.provider.getFeeData();
  if (!fees.maxFeePerGas || !fees.maxPriorityFeePerGas) return undefined;

  // calculate new maximums at least 10% higher than previously
  const base = fees.maxFeePerGas.sub(fees.maxPriorityFeePerGas);
  const newMinimumTip = MinimumBloodsuckerFee;
  const tip = Math.max(fees.maxPriorityFeePerGas.toNumber(), newMinimumTip);
  return {
    maxFeePerGas: base.mul(2).add(tip),
    maxPriorityFeePerGas: BigNumber.from(tip),
  }
}
