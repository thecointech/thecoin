import { jest } from '@jest/globals';
import { Duration } from "luxon";
import { AbsorberJs } from "./test/shockAbsorber.sim.lcl";
import { AbsorberSol } from "./test/shockAbsorber.sim.sol";

jest.setTimeout(10 * 60 * 1000);
const fiatPrincipal = 174.92;
const rate = 5.37309102
const coinCurrent = 41314033
const blockTime = Duration.fromObject({day: 1}).toMillis();
  // Fixing bad result from
// https://mumbai.polygonscan.com/tx/0xc06acc30c4d72c7c75c624707a071cec2db4260eafb6c6057801220b5bda06ae
// Where the cushion returned a negative number (but it shouldn't have)
// it ("does returns negative values when in profit", async () => {
//   const tester = new AbsorberJs(fiatPrincipal);

//   tester.reserved = 0
//   tester.coinCurrent = coinCurrent
//   tester.maxCovered = 65965633
//   const down = await tester.cushionDown(rate)
//   expect(down).toBeLessThan(0)
// })

it ('Throws when attempting to transfer more than available', async () => {
  const tester = await AbsorberSol.create(0, blockTime);
  const depositRate = (fiatPrincipal / coinCurrent) * 1e6;
  await tester.deposit(fiatPrincipal, depositRate, blockTime);
  expect(tester.coinCurrent).toBeCloseTo(coinCurrent);

  await expect(tester.withdraw(fiatPrincipal * 2, depositRate * 1.5, blockTime * 2)).rejects.toThrow();
})
