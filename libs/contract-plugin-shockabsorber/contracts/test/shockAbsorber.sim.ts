import { toFiat, useJsTester } from './shockAbsorber.common';
import { AbsorberJs } from './shockAbsorber.sim.lcl';
import { AbsorberSol } from './shockAbsorber.sim.sol';

export type Tester = AbsorberJs | AbsorberSol;
export type Results = {
  rate: number,
  fiat?: number,
  coin?:number,
  year?: number,
}

export const createTesterShim = (fiatPrincipal: number, useJsTester: boolean, blockTime?: number) =>
  useJsTester
    ? new AbsorberJs(fiatPrincipal)
    : AbsorberSol.create(fiatPrincipal,blockTime);

export const createTester = (fiatPrincipal: number, blockTime?: number) => createTesterShim(fiatPrincipal, useJsTester, blockTime);
export const createTesterSync = (fiatPrincipal: number, jsOverride?: boolean) => {
  const inst = {
    tester: null as unknown as Tester,
  }
  beforeAll(async () => {
    inst.tester = await createTesterShim(fiatPrincipal, jsOverride ?? useJsTester);
  })
  return inst;
}

export const testResults = async (tester: Tester, results: Results) => {
  // console.log("================================================================")
  const fiatCurrent = toFiat(tester.coinCurrent, results.rate);
  const isUp = fiatCurrent > tester.fiatPrincipal;

  let r = (isUp)
    ? await tester.cushionUp(results.rate, results.year)
    : await tester.cushionDown(results.rate);
  if (r == -0) r = 0;
  if (results.fiat) {
    const cushion = toFiat(r, results.rate) * (isUp ? -1 : 1);
    const expected = Math.round(100 * (fiatCurrent + cushion)) / 100;
    expect(expected).toEqual(results.fiat);
  }
  if (results.coin !== undefined) {
    // This odd-looking comparison allows differences of 1,
    // to account for rounding in JS vs Sol, but still
    // keep a proper error message on failure
    if (Math.abs(r - results.coin) != 1) {
      expect(r).toEqual(results.coin);
    }
  }
}


// export const runAbsorber = async (client1: {address: string}, absorber: ShockAbsorber, oracle: SpxCadOracle, tcCore: TheCoin, price: number, expectedFiat: number) => {
//   console.log(`------------------ Testing Price: ${price} ------------------`);
//   // Compensate for any changes to time in the tests calling this
//   const lastBlock = await hre.ethers.provider.getBlock("latest");
//   const currentValid = await oracle.validUntil();
//   const millisBetween = (1000 * lastBlock.timestamp) - currentValid.toNumber();
//   const daysBetween = millisBetween / (1000 * 60 * 60 * 24);
//   const toAdvance = Math.max(1, Math.round(daysBetween));
//   // Set the new rate
//   await setOracleValueRepeat(oracle, price, toAdvance);
//   // Ensure that the block time is within lastest oracle block validity
//   const currentBlock = await hre.ethers.provider.getBlock("latest");
//   const currentTs = await oracle.validUntil();
//   const diff = Duration.fromMillis(currentTs.toNumber() - (currentBlock.timestamp * 1000));
//   // If block time is not within lastest oracle block validity, wait until it is
//   if (diff.as('days') > 1) {
//     await time.increaseTo(currentTs.div(1000).sub(3600));
//   }
//   // What does the client do?
//   const reportedCoin = await tcCore.pl_balanceOf(client1.address);
//   const currentFiat = await absorber['toFiat(int256,uint256)'](reportedCoin, currentTs.sub(3600_000));
//   // We may be 1c off due to rounding issues using int's everywhere
//   expect(Math.abs(currentFiat.toNumber() - expectedFiat)).toBeLessThanOrEqual(1);
// }
