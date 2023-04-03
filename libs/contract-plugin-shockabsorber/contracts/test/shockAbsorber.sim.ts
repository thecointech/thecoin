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
  const fiatCurrent = toFiat(tester.coinCurrent, results.rate);
  const isUp = fiatCurrent > tester.fiatPrincipal;

  let r = (isUp)
    ? await tester.cushionUp(results.rate, results.year)
    : await tester.cushionDown(results.rate, results.year);
  if (r == -0) r = 0;
  if (results.fiat) {
    const cushion = toFiat(r, results.rate) * (isUp ? -1 : 1);
    const expected = fiatCurrent + cushion;
    expect(expected).toBeCloseTo(results.fiat, 0.5); // accuracy to ~$0.25
  }
  if (results.coin !== undefined) {
    // This odd-looking comparison allows differences of 1,
    // to account for rounding in JS vs Sol, but still
    // keep a proper error message on failure
    expect(r).toBeCloseTo(results.coin, -1);
  }
}
