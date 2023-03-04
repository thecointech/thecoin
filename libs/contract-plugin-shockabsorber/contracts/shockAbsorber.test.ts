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

const runAbsorber = async (client1: {address: string}, absorber: ShockAbsorber, oracle: SpxCadOracle, price: number, expectedFiat: number, date: DateObject={year: 2020}) => {
  const d = DateTime.fromObject(date)

  // Set the new rate
  await setOracleValueRepeat(oracle, price, 1);
  // Get the new validUntil
  const currentTs = (await oracle.validUntil()).sub(3600 * 1000);
  time.increaseTo(currentTs.div(1000));
  // What does the client do?
  const modifiedCoin = await absorber.balanceOf(client1.address, 50e6);
  const currentFiat = await absorber['toFiat(int256,uint256)'](modifiedCoin, currentTs);
  // We may be 1c off due to rounding issues using int's everywhere
  expect(Math.abs(currentFiat.toNumber() - expectedFiat)).toBeLessThanOrEqual(1);
}

it('cushions correctly when entire principal is protected', async () => {
  const { Owner, client1, OracleUpdater } = initAccounts(await hre.ethers.getSigners());
  const ShockAbsorber = await hre.ethers.getContractFactory('ShockAbsorber');
  const tcCore = await createAndInitTheCoin(Owner);
  const oracle = await createAndInitOracle(OracleUpdater, 100);

  // pass $5000
  await tcCore.mintCoins(50e6, Owner.address, Date.now());
  await tcCore.transfer(client1.address, 50e6);

  // Create plugin
  const absorber = await ShockAbsorber.deploy();
  await absorber.initialize(tcCore.address, oracle.address);

  // Assign a user
  await tcCore.pl_assignPlugin(client1.address, absorber.address, ALL_PERMISSIONS, "0x1234");

  // First run, nothing changes
  await runAbsorber(client1, absorber, oracle, 100, 5000e2);
  // Market drops 10%
  await runAbsorber(client1, absorber, oracle, 90, 5000e2);
  // Market drops another 10%
  await runAbsorber(client1, absorber, oracle, 80, 5000e2);
  // Test slowly dropping past 50%
  await runAbsorber(client1, absorber, oracle, 51, 5000e2);
  await runAbsorber(client1, absorber, oracle, 50, 5000e2);
  await runAbsorber(client1, absorber, oracle, 49, 4900e2);
  // Market drops all the way to 40%, now we should have lost 20%
  await runAbsorber(client1, absorber, oracle, 40, 4000e2);
  // now it jumps back up to 80%
  await runAbsorber(client1, absorber, oracle, 80, 5000e2);

  // Test run up
  await runAbsorber(client1, absorber, oracle, 98, 5000e2);
  await runAbsorber(client1, absorber, oracle, 100, 5000e2);
  await runAbsorber(client1, absorber, oracle, 101, 5000e2);
  await runAbsorber(client1, absorber, oracle, 102, 5010e2); //0.5% gain
  await runAbsorber(client1, absorber, oracle, 104, 5000e2);
  await runAbsorber(client1, absorber, oracle, 106, 5000e2);
  await runAbsorber(client1, absorber, oracle, 108, 10200);
  await runAbsorber(client1, absorber, oracle, 110, 10400);

  // before dropping all the way to 30%
  await runAbsorber(client1, absorber, oracle, 30, 6000);

  // Test wild swings
  await runAbsorber(client1, absorber, oracle, 120, 11400);
  await runAbsorber(client1, absorber, oracle, 25, 5000);
});

// it('cushions correctly when only some principal is protected', () => {
//   const state = zeroState(start);
//   state.coin = new Decimal(100);
//   state.principal = new Decimal(10000);
//   params.shockAbsorber.maximumProtected = new Decimal(5000);

//   // First run, nothing changes
//   runAbsorber(state, 100, 10000);
//   // Market drops 10%
//   runAbsorber(state, 90, 9500);
//   // Market drops another 10%
//   runAbsorber(state, 80, 9000);
//   // Test slowly dropping past 50%
//   runAbsorber(state, 51, 7550);
//   runAbsorber(state, 50, 7500);
//   runAbsorber(state, 49, 7350);
//   // Market drops all the way to 40%
//   runAbsorber(state, 40, 6000);
//   // Test run up
//   runAbsorber(state, 98, 9900);
//   runAbsorber(state, 100, 10000);
//   runAbsorber(state, 101, 10050);
//   runAbsorber(state, 104, 10200);
//   runAbsorber(state, 106, 10300);
//   runAbsorber(state, 108, 10500);
//   runAbsorber(state, 110, 10700);
// })

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
