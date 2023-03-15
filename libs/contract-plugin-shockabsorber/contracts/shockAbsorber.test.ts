import { jest } from '@jest/globals';
import { createTesterShim, toFiat, yearInMs } from './shockabsorber.sim'

jest.setTimeout(10 * 60 * 1000);
// always use SOL tester in CI
const useJsTester = !process.env.JEST_CI || true;

const createTester = (fiatPrincipal: number) => createTesterShim(fiatPrincipal, useJsTester);

type Results = {
  rate: number,
  fiat?: number,
  coin?:number,
  year?: number,
}
type Tester = ReturnType<typeof createTester>;
export const testResults = async (tester: Tester, results: Results) => {
  const fiatCurrent = toFiat(tester.coinCurrent, results.rate);
  const isUp = fiatCurrent > tester.fiatPrincipal;

  let r = (isUp)
    ? await tester.cushionUp(results.rate, results.year)
    : await tester.cushionDown(results.rate);
  if (r == -0) r = 0;
  if (results.fiat) {
    const cushion = toFiat(r, results.rate) * (isUp ? -1 : 1);
    expect(fiatCurrent + cushion).toEqual(results.fiat);
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

///////////////////////////////////////////////////////////////////////////
// Actual tests here
///////////////////////////////////////////////////////////////////////////

describe('cushionUp with principal covered', () => {

  const tester = createTester(5000);
  it.each([
    { rate: 100,   fiat: 5000, coin: 0 },
    { rate: 100.5, fiat: 5000, coin: 248757 },
    { rate: 101,   fiat: 5000, coin: 495050 },
    { rate: 101.5, fiat: 5000, coin: 738916 },
    // After this point, the cushion is full and stops growing
    { rate: 102, coin: 738916 },
    { rate: 105, coin: 738916 },
    { rate: 115, coin: 738916 },
  ])(`with %s`, async (inputs) => testResults(tester, inputs));
});

describe('cushionUp with partial principal covered', () => {
  const tester = createTester(10000);

  it.each([
    { rate: 100,   fiat: 10000, coin: 0 },
    { rate: 100.5, fiat: 10025, coin: 248756 },
    { rate: 101,   fiat: 10050, coin: 495050 },
    { rate: 101.5, fiat: 10075, coin: 738916 },
    // After this point, the cushion is full and stops growing
    { rate: 102, coin: 738916 },
    { rate: 103, coin: 738916 },
    { rate: 105, coin: 738916 },
    { rate: 115, coin: 738916 },
  ])(`with %s`, async (inputs) => testResults(tester, inputs));
})

describe('cushionUp over years', () => {
  const tester = createTester(10000);
  it.each([
    { year: 1, rate: 100,   fiat: 10000, coin: 0 },
    { year: 1, rate: 101.5, fiat: 10075, coin: 738916 },
    { year: 1, rate: 103, fiat: 10223.89, coin: 738916 },
    // the cushion doesn't eat unprotected even over yeras
    { year: 2, rate: 100,   fiat: 10000, coin: 0 },
    { year: 2, rate: 101.5, fiat: 10075, coin: 738916 },
    // NOTE: Less cushion is reserved in the following year
    // (in coin) due to the higher rate.
    { year: 2, rate: 103, fiat: 10150, coin: 1456311 },
    { year: 2, rate: 104,              coin: 1456311 },
  ])(`with %s`, async (inputs) => testResults(tester, inputs));
})

describe('cushionDown with principal covered', () => {
  const tester = createTester(5000);
  it.each([
    { rate: 100,   fiat: 5000, coin: 0 },
    { rate: 99.9,  fiat: 5000, },
    { rate: 80,    fiat: 5000, },
    { rate: 50,    fiat: 5000, coin: 50e6},
    // After this point, the cushion is expended
    { rate: 49.9, coin: 50e6 },
    { rate: 30, coin: 50e6 },
  ])(`with %s`, async (inputs) => testResults(tester, inputs));
})

describe('cushionDown with principal partially covered', () => {
  const tester = createTester(10000);
  it.each([
    { rate: 100,   fiat: 10000, coin: 0 },
    { rate: 90,    fiat: 9500, },
    { rate: 50,    fiat: 7500, coin: 50e6},
    // After this point, the cushion is expended
    { rate: 49.9, coin: 50e6 },
    { rate: 30, coin: 50e6 },
  ])(`with %s`, async (inputs) => testResults(tester, inputs))
})

describe('dep & withdraw track avg principal', () => {
  it ('adjusts avg with deposits', async () => {
    const tester = createTester(0);
    // 5 deposits, evenly spaced through the year
    for (let i = 0; i < 5; i++) {
      const timeMs = i * (yearInMs / 5);
      await tester.deposit(100, 100, timeMs);
    }
    expect(tester.fiatPrincipal).toEqual(500);
    const avgFiat = await tester.getAvgFiatPrincipal(yearInMs);
    // 100 + 100 × 0.8 + 100 × 0.6 + 100 × 0.4 + 100 × 0.2
    expect(avgFiat).toEqual(300);
  })

  it ('adjusts avg with withdrawals', async () => {
    const tester = createTester(500);
    // 5 withdrawals, evenly spaced through the year
    for (let i = 0; i < 5; i++) {
      const timeMs = (i + 1) * (yearInMs / 5);
      await tester.withdraw(100, 100, timeMs);
    }
    expect(tester.fiatPrincipal).toEqual(0);
    const avgFiat = await tester.getAvgFiatPrincipal(yearInMs);
    // 100 + 100 × 0.8 + 100 × 0.6 + 100 × 0.4 + 100 × 0.2
    expect(avgFiat).toEqual(300);
  })

  it.each([
    { year: 0, reserved: 0 },
    { year: 1, reserved: 738916 },
    { year: 2, reserved: 1456310 },
  ])(`draws down on whole year, fully covered %s`, async (inputs) => {
    const tester = createTester(5000);
    const r = await tester.drawDownCushion(inputs.year * yearInMs);
    expect(r).toEqual(inputs.reserved);
  })

  it.each([
    { year: 0, reserved: 0 },
    { year: 1, reserved: 738916 },
    { year: 2, reserved: 1456310 },
  ])(`draws down on whole year, partially covered %s`, async (inputs) => {
    const tester = createTester(10000);
    const r = await tester.drawDownCushion(inputs.year * yearInMs);
    expect(r).toEqual(inputs.reserved);
  })

  it ('correcly calculates balance after drawDownCushion', async () => {
    const tester = createTester(5000);
    // This will reduce the reserved balance
    await tester.drawDownCushion(yearInMs);

    await testResults(tester, {year: 2, rate: 50,  fiat: 5000 });
    await testResults(tester, {year: 2, rate: 100, fiat: 5000 });
    await testResults(tester, {year: 2, rate: 101.5, fiat: 5000, coin: 0 });
    await testResults(tester, {year: 2, rate: 103, fiat: 5000, coin: 717395 });
    // As rate goes up, the cushion does not grow
    await testResults(tester, {year: 2, rate: 104, coin: 717395 });
    await testResults(tester, {year: 2, rate: 110, coin: 717395 });
  })
  // it ('draws down cushion correctly on year-end', async () => {
  //   const tester = createTester(5000);
  //   await tester.drawDownCushion(yearInMs);
  //   expect(tester.fiatPrincipal).toEqual(0);
  //   const avgFiat = await tester.getAvgFiatPrincipal(yearInMs);
  //   // 100 + 100 × 0.8 + 100 × 0.6 + 100 × 0.4 + 100 × 0.2
  //   expect(avgFiat).toEqual(300);
  // })
})

describe('cushionUp with drawDown', () => {
  const tester = createTester(5000);
  it.each([
    { year: 1, rate: 100,   fiat: 5000, coin: 0 },
    { year: 1, rate: 101.5, fiat: 5000, coin: 738916},
    { year: 1, rate: 103,   fiat: 5073.89, coin: 738916 },
    { year: 2, rate: 100,   fiat: 5000, coin: 0 },
    { year: 2, rate: 101.5, fiat: 5000, coin: 738916 },
    { year: 2, rate: 103,   fiat: 5000, coin: 1456310 },
  ])(`with %s`, async (inputs) => {
    // call drawDownCushion prior to running the test
    const year = inputs.year - 1;
    if (year) {
      tester.drawDownCushion(inputs.rate, year);
    }
    testResults(tester, inputs);
  })
})
// //////////////////////////////////////////////////////////////////////

// describe('It calculates the cushion reserve when all principal covered', () => {

//   it.each([
//     { rate: 100,   fiat: 5000e2, coin: 0 },
//     { rate: 100.5, fiat: 5000e2, coin: 248756 },
//     { rate: 101,   fiat: 5000e2, coin: 495050 },
//     { rate: 101.5, fiat: 5000e2, coin: 738916 },
//     // After this point, the cushion is full and stops growing
//     { rate: 102, coin: 738916 },
//     { rate: 105, coin: 738916 },
//     { rate: 115, coin: 738916 },
//   ])(`with %s`, async ({ rate, coin, fiat }) => {

//     const curr = rate * 50e2;
//     const coinPrincipal = toCoin(5000, rate);
//     const r = await absorber.calcCushionUp(5000e2, coinPrincipal, 50e6, 0, 1);
//     if (fiat) {
//       // Assert that the amount reserved does not take balance below reserve
//       const reserved = r.toNumber() * rate / 1e4;
//       expect(Math.round(curr - reserved)).toEqual(fiat);
//     }
//     if (coin) {
//       expect(r.toNumber()).toEqual(coin);
//     }
//   });

// });

// describe('It calculates the cushion reserve when some principal covered', () => {

//   it.each([
//     { rate: 100,   fiat: 10000e2, coin: 0 },
//     { rate: 100.5, fiat: 10025e2, coin: 248756 },
//     { rate: 101,   fiat: 10050e2, coin: 495050 },
//     { rate: 101.5, fiat: 10075e2, coin: 738916 },
//     // After this point, the cushion is full and stops growing
//     { rate: 102, coin: 738916 },
//     { rate: 103, coin: 738916 },
//     { rate: 105, coin: 738916 },
//     { rate: 115, coin: 738916 },
//   ])(`with %s`, async ({ rate, coin, fiat }) => {

//     const curr = rate * 100e2;
//     const r = await absorber.calcCushionUp(10_000e2, 100e6, curr, 0, maxCushionUp);
//     if (fiat) {
//       // Assert that the amount reserved does not take balance below reserve
//       const reserved = r.toNumber() * rate / 1e4;
//       expect(Math.round(curr - reserved)).toEqual(fiat);
//     }
//     if (coin) {
//       expect(r.toNumber()).toEqual(coin);
//     }
//   });
// })

// describe('It correctly reserves cushion over years', () => {

//   it.each([
//     { year: 1, rate: 100,   fiat: 10000e2, coin: 0 },
//     { year: 1, rate: 101.5, fiat: 10075e2, coin: 738916 },
//     // the cushion doesn't eat unprotected even over yeras
//     { year: 2, rate: 101.5, fiat: 10075e2, coin: 738916 },
//     // But it does add to cushion from prior years growth
//     { year: 1, rate: 103, fiat: 10223_89, coin: 738916 },
//     // NOTE: Less cushion is reserved in the following year
//     // (in coin) due to the higher percentage affecting the rate.
//     // THIS IS PROBABLY NOT WHAT WE WANT.
//     // The cushion reserve should be constant
//     { year: 2, rate: 103, fiat: 10150e2, coin: 1456310 },
//   ])(`with %s`, async ({ year, rate, coin, fiat }) => {

//     const curr = rate * 100e2;
//     const r = await absorber.calcCushionUp(10_000e2, 100e6, curr, 0, maxCushionUp * year);
//     if (fiat) {
//       // Assert that the amount reserved does not take balance below reserve
//       const reserved = r.toNumber() * rate / 1e4;
//       expect(Math.round(curr - reserved)).toEqual(fiat);
//     }
//     if (coin) {
//       expect(r.toNumber()).toEqual(coin);
//     }
//   });
// })

// describe('It correctly cushions entire principal on a drop', () => {
//   it.each([
//     { rate: 100,   fiat: 5000e2, coin: 0 },
//     { rate: 99.9,  fiat: 5000e2, },
//     { rate: 80,    fiat: 5000e2, },
//     { rate: 50,    fiat: 5000e2, coin: 50e6},
//     // After this point, the cushion is expended
//     { rate: 49.9, coin: 50e6 },
//     { rate: 30, coin: 50e6 },
//   ])(`with %s`, async ({ rate, coin, fiat }) => {

//     const fiatCurrent = rate * 50e2;
//     const coinPrincipal = toCoin(5000, rate);
//     const r = await absorber.calcCushionDown(5000e2, coinPrincipal, 50e6);
//     if (fiat) {
//       // Assert that the amount reserved does not take balance below reserve
//       const reserved = r.toNumber() * rate / 1e4;
//       expect(Math.round(fiatCurrent + reserved)).toEqual(fiat);
//     }
//     if (coin) {
//       expect(r.toNumber()).toEqual(coin);
//     }
//   });
// })

// describe('It correctly cushions partial principal on a drop', () => {
//   it.each([
//     { rate: 100,   fiat: 10000e2, coin: 0 },
//     { rate: 90,    fiat: 9500e2, },
//     { rate: 50,    fiat: 7500e2, coin: 50e6},
//     // After this point, the cushion is expended
//     { rate: 49.9, coin: 50e6 },
//     { rate: 30, coin: 50e6 },
//   ])(`with %s`, async ({ rate, coin, fiat }) => {

//     console.log("----------- Testing: rate", rate, "coin", coin, "fiat", fiat)
//     const coinPrincipal = toCoin(10000, rate);
//     const fiatCurrent = rate * 100e2;
//     const r = await absorber.calcCushionDown(10000e2, coinPrincipal, 100e6);
//     if (fiat) {
//       // Assert that the amount reserved does not take balance below reserve
//       const reserved = r.toNumber() * rate / 1e4;
//       expect(Math.round(fiatCurrent + reserved)).toEqual(fiat);
//     }
//     if (coin) {
//       expect(r.toNumber()).toEqual(coin);
//     }
//   });
// })

// describe("It runs correcly live", () => {

//   it ('runs correctly live', async () => {
//     const { absorber, client1, oracle, tcCore } = await setupLive(10_000);
//     const started = await absorber.msNow();
//     await runAbsorber(client1, absorber, oracle, tcCore, 100, 10000e2);
//     await runAbsorber(client1, absorber, oracle, tcCore, 110, 10918_71);
//     await runAbsorber(client1, absorber, oracle, tcCore, 100, 10000e2);
//     await runAbsorber(client1, absorber, oracle, tcCore, 90, 9500e2);

//     await time.increase(aYear + aDay);
//     await runAbsorber(client1, absorber, oracle, tcCore, 90, 9500e2);
//     await runAbsorber(client1, absorber, oracle, tcCore, 110, 10839_80);

//     // Draw down the first years cushion
//     const msNow = await absorber.msNow();
//     await absorber.drawDownCushion(client1.address);
//     // Should increase the contracts balance
//     const balanceAb = await tcCore.balanceOf(absorber.address);
//     // $75 @ 101.5 = 738916
//     expect(balanceAb.toNumber()).toEqual(738916);
//     // But the users balance doesn't (shouldn') actually change
//     await runAbsorber(client1, absorber, oracle, tcCore, 110, 10838_03);
//     await runAbsorber(client1, absorber, oracle, tcCore, 100, 10000e2);
//     await runAbsorber(client1, absorber, oracle, tcCore, 90, 10000e2);

//     // 3 more years, total reseerve is 75 * 5 = 375
//     await time.increase(aYear * 3);
//     await runAbsorber(client1, absorber, oracle, tcCore, 110, 10525e2);
//     await absorber.drawDownCushion(client1.address);
//     await runAbsorber(client1, absorber, oracle, tcCore, 110, 10525e2);
//   })
// })
