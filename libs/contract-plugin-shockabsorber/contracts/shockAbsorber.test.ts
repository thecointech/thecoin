import hre from 'hardhat';
import { jest } from '@jest/globals';
import { createAndInitOracle, setOracleValueRepeat } from '@thecointech/contract-oracle/testHelpers.ts';
import { initAccounts, createAndInitTheCoin } from '@thecointech/contract-core/testHelpers.ts';
import { DateObject, DateTime } from 'luxon';
import '@nomiclabs/hardhat-ethers';
import { ShockAbsorber } from '../src';
import type { SpxCadOracle } from '@thecointech/contract-oracle';
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ALL_PERMISSIONS } from '@thecointech/contract-plugins';
import { TheCoin } from '@thecointech/contract-core/*';
jest.setTimeout(10 * 60 * 1000);

const start = DateTime.fromObject({ year: 2020 });
// const params = createParams({
//   ...basicParams,
//   maxOffsetPercentage: 0,
//   shockAbsorber: {
//     // for a max drop of 50%
//     cushionDown: new Decimal(0.50),
//     // Using up to 6% of profit
//     cushionUp: new Decimal(0.06),
//   }
// });

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

  const balance = await tcCore.pl_balanceOf(client1.address);
  console.log(balance.toNumber());

  // Create plugin
  const absorber = await ShockAbsorber.deploy();
  await absorber.initialize(tcCore.address, oracle.address);

  // Assign a user
  await tcCore.pl_assignPlugin(client1.address, absorber.address, ALL_PERMISSIONS, "0x1234");

  const balance2 = await tcCore.pl_balanceOf(client1.address);
  console.log(balance2.toNumber());

  return { absorber, client1, oracle, tcCore };
}

const runAbsorber = async (client1: {address: string}, absorber: ShockAbsorber, oracle: SpxCadOracle, tcCore: TheCoin, price: number, expectedFiat: number, date: DateObject={year: 2020}) => {
  console.log(`------------------ Testing Price: ${price} ------------------`);
  // Set the new rate
  await setOracleValueRepeat(oracle, price, 1);
  // Get the new validUntil
  const currentTs = (await oracle.validUntil()).sub(3600 * 1000);
  time.increaseTo(currentTs.div(1000));
  // What does the client do?
  const reportedCoin = await tcCore.pl_balanceOf(client1.address);
  const currentFiat = await absorber['toFiat(int256,uint256)'](reportedCoin, currentTs);
  // We may be 1c off due to rounding issues using int's everywhere
  expect(Math.abs(currentFiat.toNumber() - expectedFiat)).toBeLessThanOrEqual(1);
}
