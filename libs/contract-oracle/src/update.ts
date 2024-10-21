import { log } from '@thecointech/logging';
import { SpxCadOracle } from './codegen';
import { getOverrideFees } from '@thecointech/contract-base';
// import { DateTime, Duration } from 'luxon';

type RateFactory = (millis: number) => Promise<{rate: number, from: number, to: number}|null>;

const MAX_LENGTH = 1000;
const ONE_HR = 1000 * 60 * 60;
const ONE_MONTH = ONE_HR * 24 * 30;

export async function updateRates(oracle: SpxCadOracle, till: number, rateFactory: RateFactory) {

  const decimals = await oracle.decimals();
  const factor = Math.pow(10, Number(decimals));
  const from = Number(await oracle.validUntil());
  const blockTime = Number(await oracle.BLOCK_TIME());
  const lastOffsetFrom = Number(await oracle.lastOffsetFrom());
  let priorOffset = Number(await oracle.getOffset(from));
  let timestamp = from;

  log.info(
    { from: new Date(from), till: new Date(till), lastOffsetFrom, priorOffset, },
    'Updating Oracle from {from} to {till}: last: {lastOffsetFrom}, prior: {priorOffset}'
  );

  // Not an application error, but we should never be this far out of date
  const hoursToUpdate = (till - from) / ONE_HR;
  if (hoursToUpdate > 24 && !process.env.JEST_WORKER_ID) {
    log.warn({hours: hoursToUpdate}, "Oracle is {hours}hrs out-of-date");
  }

  const rates: number[] = [];
  const offsets: {from: number, offset: number}[] = [];
  let lastMessagePosted = from;
  while (timestamp < till) {
    const r = await rateFactory(timestamp);
    if (!r) {
      log.trace("No rate for timestamp", {timestamp});
      break;
    }

    // Error checking
    if (r.from != timestamp) {
      log.error(
        {from: new Date(r.from), timestamp: new Date(timestamp)},
        "Oracle block does not start at the same time as service: {from} != {timestamp}"
      );
      // Not fatal, our offset calculation can handle this.
    }

    // rates have 8 decimal points
    let rate = Math.round(r.rate * factor);
    // How long is this rate valid for?
    // We use timestamp instead of (r.to) in case
    // of difference between oracle/service time
    let duration = r.to - timestamp;

    const toAdd = calculateNumBlocks(duration, blockTime);

    if (toAdd.offset) {
      log.info(
        { offset: toAdd.offset },
        'Rate.to is not an even multiple of blockTime: applying offset {offset}'
      );
      // Our new offset shifts our final block in time.  Our first
      // block always starts at the 'correct' time so we only need
      // to care about the finish time.
      const newOffset = Math.round(toAdd.offset);
      // Trigger the offset on the boundary of the final regular-length
      // block (ie multiple of blocktime).
      // If the block is shortened (eg - negative offset)
      // then the border is when the block actually ends: eg r.to
      // If the block is lengthened (eg - positive offset)
      // then the new offset has to be applied when the final
      // block would normally finish (which is before r.to).
      const timeBeforeEndToApplyOffset = Math.max(0, newOffset);
      const finalOffset = newOffset + priorOffset;
      offsets.push({
        from: r.to - timeBeforeEndToApplyOffset,
        offset: finalOffset,
      });
      priorOffset = finalOffset;
    }
    for (let i = 0; i < toAdd.numBlocks; i++) {
      rates.push(rate);
    }

    timestamp = r.to;

    if (timestamp - lastMessagePosted > ONE_MONTH) {
      log.debug(
        { timestamp: new Date(timestamp), length: rates.length },
        '{length} rates fetched reaches {timestamp}'
      )
      lastMessagePosted = timestamp
    }
  }

  log.info(
    { timestamp, length: rates.length, date: new Date(timestamp) },
    "Completed fetch with {length} new rates reaching {timestamp} - {date}"
  )

  // We have pushed too many rates repeatedly, so double-check here
  const doubleCheckValidUntil = from + (rates.length * blockTime);
  const maxLegalValidUntil = Date.now() + (1.5 * blockTime);
  if (doubleCheckValidUntil > maxLegalValidUntil) {
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
      await tx.wait();
    }

    // If we have enough rates, push them to the oracle
    if (rates.length == 1) {
      // The majority of time, we only have one rate to push
      // So use this function, as it's a wee bit cheaper than the below
      const overrides = await getOverrideFees(oracle);
      const tx = await oracle.update(rates[0], overrides);
      log.info(`Waiting single insert: ${tx.hash}`)
      await tx.wait();
    }
    else if (rates.length > 1) {
      for (let s = 0; s < rates.length; s += MAX_LENGTH) {
        log.trace(`Updating rates: ${s} of ${rates.length}`);
        const e = Math.min(s + MAX_LENGTH, rates.length);
        const overrides = await getOverrideFees(oracle);
        const tx = await oracle.bulkUpdate(rates.slice(s, e), overrides);
        log.info(`Waiting bulk insert: ${tx.hash}`)
        await tx.wait();
      }
    }
    log.trace(`Updated ${rates.length} new rates, until ${timestamp} : ${new Date(timestamp)}`)

    const newLatest = await oracle.validUntil();
    log.trace(`New contract latest: ${new Date(Number(newLatest))}`);
  }
  catch (err: any) {
    log.error(err, "Error updating oracle");
    // await SendMail("Error updating oracle", err.message);
    throw err;
  }

  return true;
}

function calculateNumBlocks(duration: number, blockTime: number) {
  const blockRatio = duration / blockTime; // Total number of blocks to add
  // We explicitly add duplicates.  This is because
  // our oracle is optimized for look-up by using a
  // consistent duration for every time block
  let numBlocks = Math.floor(blockRatio);
  const offsetRatio = blockRatio - numBlocks;
  if (offsetRatio == 0) {
    return { numBlocks, }
  }
  // What's the shortest distance to a round number of blocks?
  // Handle cases where duration is not a multiple of blockTime
  // This happens during DST changes and colossal fuckups
  if (offsetRatio > 0.5 || numBlocks == 0) {
    // We need to add most of block.
    // Add a new block & shorten it
    return {
      numBlocks: numBlocks + 1,
      offset: (offsetRatio * blockTime) - blockTime,
    }
  } else {
    return {
      numBlocks,
      offset: offsetRatio * blockTime,
    }
  }
}

// Dup 3x, must be refactored
// const MinimumBloodsuckerFee = 30 * Math.pow(10, 9);

// async function getOverrideFees(oracle: SpxCadOracle) {
//   const fees = await oracle.runner?.provider?.getFeeData();
//   if (!fees?.maxFeePerGas || !fees?.maxPriorityFeePerGas) {
//     throw new Error("Failed to get fees");
//   }

//   // calculate new maximums at least 10% higher than previously
//   const base = fees.maxFeePerGas - fees.maxPriorityFeePerGas;
//   const newMinimumTip = MinimumBloodsuckerFee;
//   const tip = Math.max(fees.maxPriorityFeePerGas, newMinimumTip);
//   return {
//     maxFeePerGas: base.mul(2).add(tip),
//     maxPriorityFeePerGas: BigNumber.from(tip),
//   }
// }
