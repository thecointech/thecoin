import { log } from '@thecointech/logging';
import { SpxCadOracle } from './types';

type RateFactory = (seconds: number) => Promise<{rate: number, from: number, to: number}|null>;

const MAX_LENGTH = 1000;

export async function updateRates(oracle: SpxCadOracle, till: number, rateFactory: RateFactory) {

  const factor = Math.pow(10, await oracle.decimals());
  const from = (await oracle.validUntil()).toNumber();
  const blockTime = (await oracle.BLOCK_TIME()).toNumber();
  let priorOffset = (await oracle.getOffset(from)).toNumber();
  let timestamp = from;

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
    let duration = to - r.from;

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

    // If not 3 hours in length, we use the offset to
    // shorten/lengthen the current block
    if (duration != blockTime) {
      const newOffset = (priorOffset + (duration - blockTime)) % blockTime;
      offsets.push({
        from: to - duration,
        offset: newOffset,
      });
      timestamp += (newOffset - priorOffset);
      priorOffset = newOffset;
    }
  }

  try {
    // If we have enough rates, push them to the oracle
    if (rates.length == 1) {
      // The majority of time, we only have one rate to push
      // So use this function, as it's a wee bit cheaper than the below
      await oracle.update(rates[0]);
    }
    else if (rates.length > 1) {
      for (let s = 0; s < rates.length; s += MAX_LENGTH) {
        const e = Math.min(s + MAX_LENGTH, rates.length);
        await oracle.bulkUpdate(rates.slice(s, e));
      }
    }
    log.trace(`Updated ${rates.length} new rates, until ${timestamp} : ${new Date(timestamp * 1000)}`)

    // If we have offsets, push them to the oracle
    for (const offset of offsets) {
      await oracle.updateOffset(offset);
      log.trace(`Pushing new Offset ${offset.offset} at ${new Date(offset.from * 1000)}`)
    }
  }
  catch (err: any) {
    log.error({err}, "Error updating oracle");
    // await SendMail("Error updating oracle", err.message);
    throw err;
  }

  return true;
}
