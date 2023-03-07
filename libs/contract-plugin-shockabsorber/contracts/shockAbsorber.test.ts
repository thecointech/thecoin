import hre from 'hardhat';
import { jest } from '@jest/globals';
import { createAndInitOracle, setOracleValueRepeat } from '@thecointech/contract-oracle/testHelpers.ts';
import { initAccounts, createAndInitTheCoin } from '@thecointech/contract-core/testHelpers.ts';
import '@nomiclabs/hardhat-ethers';
import { ShockAbsorber } from '../src';
import type { SpxCadOracle } from '@thecointech/contract-oracle';
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ALL_PERMISSIONS } from '@thecointech/contract-plugins';
import { TheCoin } from '@thecointech/contract-core/*';
import { DateTime, Duration } from 'luxon';

jest.setTimeout(10 * 60 * 1000);
// beforeEach(async function () {
//   await hre.network.provider.send("hardhat_reset")
// })

const aYear = Duration.fromObject({year: 1}).as('seconds');
const aDay = Duration.fromObject({day: 1}).as('seconds');

const { absorber, client1, oracle, tcCore } = await setupTest(5_000);

describe('It calculates the cushion reserve correctly', () => {

  it.each([
    { rate: 100, fiat: 5000e2 },
    { rate: 100.5, fiat: 5000e2 },
    { rate: 101, fiat: 5000e2 },
    { rate: 101.5, fiat: 5000e2, coin: 738916 },
    // After this point, the cushion is full and stops growing
    { rate: 102, coin: 738916 },
    { rate: 105, coin: 738916 },
    { rate: 115, coin: 738916 },
  ])(`cushions up correctly for %s`, async ({ rate, coin, fiat }) => {

    const curr = rate * 50e2;
    const r = await absorber.calcCushionReserve(1, 5000e2, 50e6, curr);
    if (fiat) {
      // Assert that the amount reserved does not take balance below reserve
      const reserved = r.toNumber() * rate / 1e4;
      expect(Math.round(curr - reserved)).toEqual(fiat);
    }
    if (coin) {
      expect(r.toNumber()).toEqual(coin);
    }
  });
})

it('cushions up correctly', async function () {
  const { absorber, client1, oracle, tcCore } = await setupTest(5_000);

  await runAbsorber(client1, absorber, oracle, tcCore, 100, 5000e2);
  await runAbsorber(client1, absorber, oracle, tcCore, 101, 5000e2);
  await runAbsorber(client1, absorber, oracle, tcCore, 101.5, 5000e2);
  // Now, imagine that the cushion has been subtracted from the balance.
  // This is 0.738916 * 1.015 == $75
  // As the price rises, the cushion amount in coin remains constant
  await runAbsorber(client1, absorber, oracle, tcCore, 102, 5024_63);
  await runAbsorber(client1, absorber, oracle, tcCore, 103, 5073_89);
  await runAbsorber(client1, absorber, oracle, tcCore, 104, 5123_15);
})

it('cushions correctly when entire principal is protected', async () => {

  const { absorber, client1, oracle, tcCore } = await setupTest(5_000);
  // First run, nothing changes
  await runAbsorber(client1, absorber, oracle, tcCore, 100, 5000e2);
  // Market drops 10%
  await runAbsorber(client1, absorber, oracle, tcCore, 90, 5000e2);
  // Market drops another 10%
  await runAbsorber(client1, absorber, oracle, tcCore, 80, 5000e2);
  // Test slowly dropping past 50%
  await runAbsorber(client1, absorber, oracle, tcCore, 51, 5000e2);
  await runAbsorber(client1, absorber, oracle, tcCore, 50, 5000e2);
  await runAbsorber(client1, absorber, oracle, tcCore, 25, 2500e2);

  await runAbsorber(client1, absorber, oracle, tcCore, 49, 4900e2);
  // Market drops all the way to 40%, now we should have lost 20%
  await runAbsorber(client1, absorber, oracle, tcCore, 40, 4000e2);
  // now it jumps back up to 80%
  await runAbsorber(client1, absorber, oracle, tcCore, 80, 5000e2);

  // Test run up
  await runAbsorber(client1, absorber, oracle, tcCore, 98, 5000e2);
  await runAbsorber(client1, absorber, oracle, tcCore, 100, 5000e2);
  await runAbsorber(client1, absorber, oracle, tcCore, 101, 5000e2);
  await runAbsorber(client1, absorber, oracle, tcCore, 102, 5025e2); //0.5% gain
  await runAbsorber(client1, absorber, oracle, tcCore, 104, 5125e2);
  await runAbsorber(client1, absorber, oracle, tcCore, 106, 5225e2);
  await runAbsorber(client1, absorber, oracle, tcCore, 108, 5325e2);
  await runAbsorber(client1, absorber, oracle, tcCore, 110, 5425e2);

  // before dropping all the way to 30% (40% loss)
  await runAbsorber(client1, absorber, oracle, tcCore, 30, 3000e2);

  // Test wild swings
  await runAbsorber(client1, absorber, oracle, tcCore, 120, 5925e2);
  await runAbsorber(client1, absorber, oracle, tcCore, 25, 2500e2);
});

it('cushions correctly when only some principal is protected', async () => {

  const { absorber, client1, oracle, tcCore } = await setupTest(10_000);

  // First run, nothing changes
  await runAbsorber(client1, absorber, oracle, tcCore, 100, 10000e2);
  // Market drops 10%
  await runAbsorber(client1, absorber, oracle, tcCore, 90, 9500e2);
  // Market drops another 10%
  await runAbsorber(client1, absorber, oracle, tcCore, 80, 9000e2);
  // Test slowly dropping past 50%
  await runAbsorber(client1, absorber, oracle, tcCore, 51, 7550e2);
  await runAbsorber(client1, absorber, oracle, tcCore , 50, 7500e2);
  await runAbsorber(client1, absorber, oracle, tcCore , 49, 7350e2);
  // Market drops all the way to 40%
  await runAbsorber(client1, absorber, oracle, tcCore, 40, 6000e2);
  // Test run up
  await runAbsorber(client1, absorber, oracle, tcCore, 98, 9900e2);
  await runAbsorber(client1, absorber, oracle, tcCore , 100, 10000e2);
  await runAbsorber(client1, absorber, oracle, tcCore , 101, 10050e2);
  await runAbsorber(client1, absorber, oracle, tcCore , 104, 10325e2);
  await runAbsorber(client1, absorber, oracle, tcCore , 106, 10525e2);
  await runAbsorber(client1, absorber, oracle, tcCore , 108, 10725e2);
  await runAbsorber(client1, absorber, oracle, tcCore , 110, 10925e2);
})

it ('correctly reserves cushion over years', async () => {
  const { absorber, client1, oracle, tcCore } = await setupTest(10_000);
  // Year 1, we reserve 1.5% of the profit for $5000, or $75
  await runAbsorber(client1, absorber, oracle, tcCore, 110, 10925e2);
  // a year passes, now what happens?
  await time.increase(aYear);
  // Year 2, we reserve another 1.5% of the profit for $5000, for total $150
  await runAbsorber(client1, absorber, oracle, tcCore, 110, 10850e2);
  // Quick drop, what happens?
  await runAbsorber(client1, absorber, oracle, tcCore, 100, 10000e2);
  await runAbsorber(client1, absorber, oracle, tcCore, 90, 9500e2);
  // A year passes, same pad down but reserve an additional $75
  await time.increase(aYear);
  await runAbsorber(client1, absorber, oracle, tcCore, 90, 9500e2);
  await runAbsorber(client1, absorber, oracle, tcCore, 110, 10775e2);

  // Owner draws down the cushion reserve, nothing should change
})

it ('correctly draws down the cushion over years', async () => {
  const { absorber, client1, oracle, tcCore } = await setupTest(10_000);
  await time.increase(aYear + aDay);
  await runAbsorber(client1, absorber, oracle, tcCore, 110, 10850e2);

  await absorber.drawDownCushion(client1.address);
  await runAbsorber(absorber, absorber, oracle, tcCore, 101.5, 10850e2);
  const balanceAb = await tcCore.balanceOf(absorber.address);
  // $75 /110 = 6818181
  expect(balanceAb.toNumber()).toEqual(681818);
  // But the users balance doesn't actually change
  await runAbsorber(client1, absorber, oracle, tcCore, 110, 10850e2);
  await runAbsorber(client1, absorber, oracle, tcCore, 100, 10000e2);
  await runAbsorber(client1, absorber, oracle, tcCore, 90, 10000e2);

  // 3 more years, total reseerve is 75 * 5 = 375
  await time.increase(aYear * 3);
  await runAbsorber(client1, absorber, oracle, tcCore, 110, 10525e2);
  await absorber.drawDownCushion(client1.address);
  await runAbsorber(client1, absorber, oracle, tcCore, 110, 10525e2);

  // Check absorber balance
  await runAbsorber(absorber, absorber, oracle, tcCore, 110, 10525e2);


})

// it ('grows the cushion over time', () => {
//   const state = zeroState(start);
//   state.coin = new Decimal(100);
//   state.principal = new Decimal(10000);
//   params.shockAbsorber.maximumProtected = new Decimal(10000);

//   runAbsorber(state, 100, 10000, { year: 2020, month: 1 });
//   runAbsorber(state, 104, 10000, { year: 2020, month: 3 });
//   runAbsorber(state, 108, 10200, { year: 2020, month: 6 });

//   // Note, because the principal is capped at 10K, some of the
//   // account keeps growing even as the 10K is capped.
//   // also, it no longer matches $1 gain == 1% gain because
//   // it is now compounded from 108
//   runAbsorber(state, 108, 10200, { year: 2021, month: 1 });
//   runAbsorber(state, 112, 10207.41, { year: 2021, month: 3 });
//   // 6% up means cushion capped & 6% of 200 profit
//   runAbsorber(state, 114.48, 10212, { year: 2021, month: 3 });
//   // 8% up means cushion capped & 2% of 10000 & 8% of 200 profit
//   runAbsorber(state, 116.64, 10416, { year: 2021, month: 6 });
// })


async function setupTest(initFiat: number) {
  const { Owner, client1, OracleUpdater } = initAccounts(await hre.ethers.getSigners());
  const ShockAbsorber = await hre.ethers.getContractFactory('ShockAbsorber');
  const tcCore = await createAndInitTheCoin(Owner);
  const oracle = await createAndInitOracle(OracleUpdater, 100);

  // pass $5000
  const initCoin = initFiat * 1e6 / 100;
  await tcCore.mintCoins(initCoin, Owner.address, Date.now());
  await tcCore.transfer(client1.address, initCoin);

  // Create plugin & assign user
  const absorber = await ShockAbsorber.deploy();
  await absorber.initialize(tcCore.address, oracle.address);
  await tcCore.pl_assignPlugin(client1.address, absorber.address, ALL_PERMISSIONS, "0x1234");

  return { absorber, client1, oracle, tcCore };
}

const runAbsorber = async (client1: {address: string}, absorber: ShockAbsorber, oracle: SpxCadOracle, tcCore: TheCoin, price: number, expectedFiat: number) => {
  console.log(`------------------ Testing Price: ${price} ------------------`);
  // Compensate for any changes to time in the tests calling this
  const lastBlock = await hre.ethers.provider.getBlock("latest");
  const currentValid = await oracle.validUntil();
  const millisBetween = (1000 * lastBlock.timestamp) - currentValid.toNumber();
  const daysBetween = millisBetween / (1000 * 60 * 60 * 24);
  const toAdvance = Math.max(1, Math.round(daysBetween));
  // Set the new rate
  await setOracleValueRepeat(oracle, price, toAdvance);
  // Ensure that the block time is within lastest oracle block validity
  const currentBlock = await hre.ethers.provider.getBlock("latest");
  const currentTs = await oracle.validUntil();
  const diff = Duration.fromMillis(currentTs.toNumber() - (currentBlock.timestamp * 1000));
  // If block time is not within lastest oracle block validity, wait until it is
  if (diff.as('days') > 1) {
    await time.increaseTo(currentTs.div(1000).sub(3600));
  }
  // What does the client do?
  const reportedCoin = await tcCore.pl_balanceOf(client1.address);
  const currentFiat = await absorber['toFiat(int256,uint256)'](reportedCoin, currentTs.sub(3600_000));
  // We may be 1c off due to rounding issues using int's everywhere
  expect(Math.abs(currentFiat.toNumber() - expectedFiat)).toBeLessThanOrEqual(1);
}
