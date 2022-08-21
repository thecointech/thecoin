
 import { jest } from '@jest/globals';
import hre from 'hardhat';
import '@nomiclabs/hardhat-ethers';
import { DateTime } from 'luxon';
import liveRates from '../../../internal/rates.json' assert {type: "json"};

type JsonFxRate = typeof liveRates['rates'][0];
jest.setTimeout(5 * 60 * 1000);
const factor = Math.pow(10, 8);
const blockTime = 3 * 60 * 60;

////////////////////////////////////////////////////////////////////////////////////////
it('basic oracle functions', async () => {

  const SpxCadOracle = await hre.ethers.getContractFactory('SpxCadOracle');
  const oracle = await SpxCadOracle.deploy();

  let rates = getRates(365 * 24 * 60 * 60, blockTime);
  const initial = DateTime.fromISO("2021-01-01T00:00:00Z").toSeconds();
  let slicedRates = sliceRates(rates);
  await oracle.initialize(initial, blockTime, slicedRates.sendRates);
  while (slicedRates.remainingRates.length > 0) {
    slicedRates = sliceRates(slicedRates.remainingRates);
    await oracle.bulkUpdate(slicedRates.sendRates);
  }
  const runTest = async (timestamp: number) => {
    const exp = Math.floor(timestamp / blockTime) * blockTime;
    const r1 = await oracle.getRoundFromTimestamp(initial + timestamp);
    expect(r1.toNumber()).toEqual(exp);
  }

  await runTest(0);
  await runTest(3 * 60 * 60);
  await runTest(3600);
  await runTest(364 * 24 * 60 * 60);
});

////////////////////////////////////////////////////////////////////////////////////////
// Here we duplicate the solidity functions into JS
// so we can run them quickly & completely.  If putting
// this on the blockchain it'll take minutes for each test.
it ("it can find rate in JS version", () => {

  // ignore the first live rate, since there are some issues with the first day
  const fxRates = liveRates.rates.slice(8);
  const {rates, offsets} = prepareRates(fxRates);
  const initialTimestamp = fxRates[0].from;

  const oracle = new JSImplementations(initialTimestamp, rates, offsets);

  // Now, test every single rates to prove it's consistent
  for (const r of fxRates) {
    const test = (t: number) => {
      const s = oracle.getRoundFromTimestamp(t);
      const expected = Math.round(r.rate * factor);
      if (s != expected) {

        const offset = oracle.getOffset(t);
        const realOffsets = offsets.filter(o => o.from <= t);
        console.log(`Mismatch at ${t} (idx ${offset} != ${realOffsets[realOffsets.length - 1]?.offset})`);

        const idx = rates.indexOf(expected);
        const blockIdx = oracle.getBlockIndexFor(t);
        console.log(`Mismatch at ${t} (idx ${idx} != ${blockIdx})`);

        const v = rates[blockIdx];
        console.log(`${v} != ${expected}`);
      }
      expect(s).toEqual(expected);
    }
    test(r.from);
    test(r.to - 1);
    const duration = r.to - r.from;
    for (let i = 0; i < 3; i++) {
      const t = Math.floor(Math.random() * duration);
      test(r.from + t);
    }
  }
})

////////////////////////////////////////////////////////////////////////////////////////
// Here we test the deployment & a few iterations
// this ensures that the basics work, and that our
// algo matches the JS version tested above
it ("it can find rate in SOL version", async () => {

  const SpxCadOracle = await hre.ethers.getContractFactory('SpxCadOracle');
  const oracle = await SpxCadOracle.deploy();

  // ignore the first live rate, since there are some issues with the first day
  // Choose ~300 entries, this should always catch one DST changeover
  const start = Math.random() * (liveRates.rates.length - 300);
  const fxRates = liveRates.rates.slice(start, start + 300);
  const {rates, offsets} = prepareRates(fxRates);
  const initialTimestamp = fxRates[0].from;

  let slicedRates = sliceRates([...rates]);
  await oracle.initialize(initialTimestamp, blockTime, slicedRates.sendRates);
  while (slicedRates.remainingRates.length > 0) {
    slicedRates = sliceRates(slicedRates.remainingRates);
    await oracle.bulkUpdate(slicedRates.sendRates);
  }
  for (const offset of offsets) {
    await oracle.updateOffset(offset);
  }

  const jsoracle = new JSImplementations(initialTimestamp, rates, offsets);

  // Now, test every single rates to prove it's consistent
  for (const r of fxRates) {
    const test = async (t: number) => {
      const s = await oracle.getRoundFromTimestamp(t);
      const expected = Math.round(r.rate * factor);
      if (s.toNumber() != expected) {
        const idx = await oracle.getBlockIndexFor(t);
        const jsidx = jsoracle.getBlockIndexFor(t);
        expect(idx.toNumber()).toEqual(jsidx);
      }
      expect(s.toNumber()).toEqual(expected);
    }
    await test(r.from);
    await test(r.to - 1);
    const duration = r.to - r.from;
    for (let i = 0; i < 3; i++) {
      const t = Math.floor(Math.random() * duration);
      await test(r.from + t);
    }
  }
})

////////////////////////////////////////////////////////////////////////////////////////
// Helpers
// Running the Sol version takes so long, debugging is painful.
// We duplicate the algo here so we can run it quickly.
class JSImplementations {
  initialTimestamp: number;
  offsets: { from: number, offset: number}[];
  rates: number[];

  constructor(initialTimestamp: number, rates: number[], offsets: any) {
    this.rates = rates;
    this.offsets = offsets;
    this.initialTimestamp = initialTimestamp;
  }
  // Get the time offset for the given timestamp.
  getOffset = (timestamp: number) => {
    // Search backwards for the correct offset
    // This assumes most queries will be for current time
    for (let i = this.offsets.length - 1; i >= 0; i--) {
      if (this.offsets[i].from < timestamp) {
        return this.offsets[i].offset;
      }
    }
    return 0;
  };

  getBlockIndexFor = (timestamp: number) => {
    const offset = this.getOffset(timestamp);
    const blockIdx = (timestamp - this.initialTimestamp - offset) / blockTime;
    return Math.floor(blockIdx);
  };
  getRoundFromTimestamp = (timestamp: number) => {
    const blockIdx = this.getBlockIndexFor(timestamp);
    return this.rates[blockIdx];
  };
}


function getRates(seconds: number, blockTime: number) {
  const rates: number[] = [];
  const numEntries = seconds / blockTime; // One entry per 3 hours;
  for (let i = 0; i < numEntries; i++) {
    rates.push(i * blockTime);
  }
  return rates;
}

const MAX_LENGTH = 1000;
function sliceRates<T>(rates: T[]) {
  const sendRates = rates.slice(0, MAX_LENGTH);
  const remainingRates = rates.slice(MAX_LENGTH);
  return {sendRates, remainingRates};
}

function prepareRates(fxRates: JsonFxRate[]) {
  const rates: number[] = [];
  const offsets: {from: number, offset: number}[] = [];
  const initialTimestamp = fxRates[0].from;
  let priorOffset = 0;
  for (let i = 0; i < fxRates.length; i++) {
    const r = fxRates[i];
    const nextRate = fxRates[i + 1];

    // rates have 8 decimal points
    let rate = Math.round(r.rate * factor);
    // How long was the prior block  valid for?
    let to = nextRate?.from ?? r.to;
    let duration = to - r.from;

    // We explicitly add duplicates.  This is because
    // our oracle is optimized for look-up by using a
    // consistent duration for every time block
    while ((rates.length + 1) * blockTime < to - initialTimestamp) {
    // while (duration >= (1.5 * blockTime)) {
      rates.push(rate);
      duration -= blockTime;
    }

    // This rate should take us up to (and possibly past)
    // the blocktime boundary.
    rates.push(rate);

    // If not 3 hours in length, we use the offset to
    // shorten/lengthen the current block
    if (duration != blockTime) {
      const newOffset = (priorOffset + (duration - blockTime)) % blockTime;
      offsets.push({
        from: to - duration,
        offset: newOffset,
      });
      priorOffset = newOffset;
    }
  }
  return {rates, offsets};
}
