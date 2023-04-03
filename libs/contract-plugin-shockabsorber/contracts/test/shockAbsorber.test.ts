import { jest } from '@jest/globals';
import { toFiat, yearInMs } from './shockAbsorber.common';
import { createTester, createTesterSync, testResults } from './shockAbsorber.sim'

jest.setTimeout(10 * 60 * 1000);

///////////////////////////////////////////////////////////////////////////
// Actual tests here
///////////////////////////////////////////////////////////////////////////

describe('cushionUp with principal covered SOL', () => {
  const inst = createTesterSync(5000);
  it.each([
    { rate: 100,   fiat: 5000, coin: 0 },
    { rate: 100.5, fiat: 5000, coin: 248757 },
    { rate: 101,   fiat: 5000, coin: 495050 },
    { rate: 101.5, fiat: 5000, coin: 738916 },
    // After this point, the cushion is full and stops growing
    { rate: 102, coin: 738916 },
    { rate: 105, coin: 738916 },
    { rate: 115, coin: 738916 },
  ])(`with %s`, async (inputs) => testResults(inst.tester, inputs));
});

describe('cushionUp with principal covered JS', () => {
  const inst = createTesterSync(5000, true);
  it.each([
    { rate: 100,   fiat: 5000, coin: 0 },
    { rate: 100.5, fiat: 5000, coin: 248757 },
    { rate: 101,   fiat: 5000, coin: 495050 },
    { rate: 101.5, fiat: 5000, coin: 738916 },
    // After this point, the cushion is full and stops growing
    { rate: 102, coin: 738916 },
    { rate: 105, coin: 738916 },
    { rate: 115, coin: 738916 },
  ])(`with %s`, async (inputs) => testResults(inst.tester, inputs));
});

describe('cushionUp with partial principal covered', () => {
  const inst = createTesterSync(10000);

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
  ])(`with %s`, async (inputs) => testResults(inst.tester, inputs));
})

describe('cushionUp over years', () => {
  const inst = createTesterSync(10000);
  it.each([
    { year: 0, rate: 100,   fiat: 10000, coin: 0 },
    { year: 0, rate: 101.5, fiat: 10075, coin: 738916 },
    { year: 0, rate: 103, fiat: 10223.89, coin: 738916 },
    // the cushion doesn't eat unprotected even over yeras
    { year: 1, rate: 100,   fiat: 10000, coin: 0 },
    { year: 1, rate: 101.5, fiat: 10075, coin: 738916 },
    // NOTE: Less cushion is reserved in the following year
    // (in coin) due to the higher rate.
    { year: 1, rate: 103, fiat: 10150, coin: 1456311 },
    { year: 1, rate: 104,              coin: 1456311 },
  ])(`with %s`, async (inputs) => testResults(inst.tester, inputs));
})

describe('cushionDown for smaller principal', () => {
  it('works for small principal', async () => {
    const tester = await createTester(1000);
    const r = await tester.cushionDown(50);
    expect(r).toEqual(10e6);
  });
})

describe('cushionDown with principal covered', () => {
  const inst = createTesterSync(5000);
  it.each([
    { rate: 100,   fiat: 5000, coin: 0 },
    { rate: 99.9,  fiat: 5000, },
    { rate: 80,    fiat: 5000, },
    { rate: 50,    fiat: 5000, coin: 50e6},
    // After this point, the cushion is expended
    { rate: 49.9, coin: 50e6 },
    { rate: 30, coin: 50e6 },
  ])(`with %s`, async (inputs) => testResults(inst.tester, inputs));
})

describe('cushionDown with principal partially covered', () => {
  const inst = createTesterSync(10000);
  it.each([
    { rate: 100,   fiat: 10000, coin: 0 },
    { rate: 90,    fiat: 9500, },
    { rate: 50,    fiat: 7500, coin: 50e6},
    // After this point, the cushion is expended
    { rate: 49.9, coin: 50e6 },
    { rate: 30, coin: 50e6 },
  ])(`with %s`, async (inputs) => testResults(inst.tester, inputs))
})

describe('dep & withdraw track avg principal', () => {
  it ('adjusts avg with deposits', async () => {
    // 5 deposits, evenly spaced through the year
    const tester = await createTester(100, 2 * yearInMs);
    for (let i = 1; i < 5; i++) {
      const timeMs = i * (yearInMs / 5);
      await tester.deposit(100, 100, timeMs);
    }
    expect(tester.fiatPrincipal).toEqual(500);
    const avgFiat = await tester.getAvgFiatPrincipal(yearInMs);
    // 100 + 100 × 0.8 + 100 × 0.6 + 100 × 0.4 + 100 × 0.2
    // We gotta round it because FP errors in SOL means the
    // result is very slightly out.
    expect(Math.round(avgFiat)).toEqual(300);
  })

  it ('adjusts avg with withdrawals', async () => {
    const tester = await createTester(500, 2 * yearInMs);
    // 5 withdrawals, evenly spaced through the year
    for (let i = 0; i < 5; i++) {
      const timeMs = (i + 1) * (yearInMs / 5);
      await tester.withdraw(100, 100, timeMs);
    }
    expect(tester.fiatPrincipal).toEqual(0);
    const avgFiat = await tester.getAvgFiatPrincipal(yearInMs);
    // 100 + 100 × 0.8 + 100 × 0.6 + 100 × 0.4 + 100 × 0.2
    expect(Math.round(avgFiat)).toEqual(300);
  })

  it.each([
    { year: 0, reserved: 0 },
    { year: 1, reserved: 738916 },
    { year: 2, reserved: 1456310 },
  ])(`draws down on whole year, fully covered %s`, async (inputs) => {
    const tester = await createTester(5000, yearInMs * 5);
    const r = await tester.drawDownCushion(inputs.year * yearInMs);
    expect(r).toBeCloseTo(inputs.reserved, -1);
  })

  it.each([
    { year: 0, reserved: 0 },
    { year: 1, reserved: 738916 },
    { year: 2, reserved: 1456310 },
  ])(`draws down on whole year, partially covered %s`, async (inputs) => {
    const tester = await createTester(10000, yearInMs * 5);
    const r = await tester.drawDownCushion(inputs.year * yearInMs);
    expect(r).toBeCloseTo(inputs.reserved, -1);
  })

  it ('correcly calculates balance after drawDownCushion', async () => {
    const tester = await createTester(5000);
    // This will reduce the reserved balance
    await tester.drawDownCushion(yearInMs);

    await testResults(tester, {year: 1, rate: 50,  fiat: 5000 });
    await testResults(tester, {year: 1, rate: 100, fiat: 5000 });
    await testResults(tester, {year: 1, rate: 101.5, fiat: 5000, coin: 0 });
    await testResults(tester, {year: 1, rate: 103, fiat: 5000, coin: 717395 });
    // As rate goes up, the cushion does not grow
    await testResults(tester, {year: 1, rate: 104, coin: 717395 });
    await testResults(tester, {year: 1, rate: 110, coin: 717395 });
  })

  it ('correcly calculates balance after drawDownCushion partial covered', async () => {
    const tester = await createTester(10000);
    // This will reduce the reserved balance
    await tester.drawDownCushion(yearInMs);

    await testResults(tester, {year: 1, rate: 90,  fiat: 9500 });
    await testResults(tester, {year: 1, rate: 50,  fiat: 7500 });
    await testResults(tester, {year: 1, rate: 100, fiat: 10000 });
    await testResults(tester, {year: 1, rate: 101.5, fiat: 10075, coin: 0 });
    await testResults(tester, {year: 1, rate: 103, fiat: 10150, coin: 717395 });
    // As rate goes up, the cushion does not grow
    await testResults(tester, {year: 1, rate: 104, coin: 717395 });
    await testResults(tester, {year: 1, rate: 110, coin: 717395 });
  })
})

describe('cushionUp with drawDown', () => {
  const inst = createTesterSync(5000);

  it.each([
    // First year, drawDown does nothing
    { year: 0, rate: 100,   fiat: 5000, coin: 0 },
    { year: 0, rate: 101.5, fiat: 5000, coin: 738916},
    { year: 0, rate: 103,   fiat: 5073.89, coin: 738916 },
    // Second year, we draw down 738916, cushionUp 717395
    { year: 1, rate: 100,   fiat: 5000, coin: 738916 }, // NOTE: This will cushionDown
    { year: 1, rate: 101.5, fiat: 5000, coin: 0 },
    { year: 1, rate: 103,   fiat: 5000, coin: 717395 }, // This is cushioned up again
    { year: 1, rate: 104.5, fiat: 5072.81, coin: 717395 },
    { year: 1, rate: 106,   fiat: 5145.63, coin: 717395 },
    // Third year, we draw down 717395, cushionUp 686198
    { year: 2, rate: 106,   fiat: 5071.77, coin: 686198 },
  ])(`with %s`, async (inputs) => {
    // call drawDownCushion prior to running the test
    await inst.tester.drawDownCushion(yearInMs * inputs.year);
    await testResults(inst.tester, inputs);
  })
})

describe('Withdrawals are cushioned', () => {
  it('works when there is enough cushion', async () => {
    const tester = await createTester(1000);
    // When the rate drops, the withdrawal needs additional funds (from cushion)
    const coin = await tester.withdraw(750, 50, 100000);
    expect(coin).toEqual(15e6);
    expect(tester.fiatPrincipal).toEqual(250);
    expect(tester.coinCurrent).toEqual(0);
  })
  it('fails when there is not enough cushion', async () => {
    const tester = await createTester(1000);
    // It's dropped too far, we can't withdraw the full amount
    expect(tester.withdraw(1000, 45, 100000))
      .rejects
      .toThrow();
  })

  it('gives a proper result after withdrawal', async () => {
    const tester = await createTester(1000);
    // Rate drops, withdraw $100
    await tester.withdraw(500, 90, 100000);
    await testResults(tester, {rate: 50, fiat: 500 }); // We now have $500
    await testResults(tester, {rate: 40, fiat: 400 });
  })

  it('gives a proper result after withdrawal when market up', async () => {
    const tester = await createTester(1000);
    // Rate up 10%, withdraw 1/2.
    // We we want to still only have $500 max cushion at 50% drop of original
    await tester.withdraw(500, 110, 100000);
    expect(toFiat(tester.maxCovered, 50)).toEqual(500);
    await tester.withdraw(100, 110, 100000);
    expect(toFiat(tester.maxCovered, 50)).toEqual(400);
  })

  it('gives a proper result after series of withdrawals', async () => {
    const tester = await createTester(1000);
    await tester.withdraw(100, 90, 100000);
    await testResults(tester, {rate: 90, fiat: 900 });
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(900, 1);

    await tester.withdraw(100, 90, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(800, 1);
    await testResults(tester, {rate: 90, fiat: 800 });

    await tester.withdraw(100, 90, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(700, 1);
    await testResults(tester, {rate: 90, fiat: 700 });

    await tester.withdraw(100, 90, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(600, 1);
    await testResults(tester, {rate: 90, fiat: 600 });

    await tester.withdraw(100, 90, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(500, 0.5);
    await testResults(tester, {rate: 90, fiat: 500 }); // We now have $500

    await testResults(tester, {rate: 50, fiat: 500 });
    await testResults(tester, {rate: 40, fiat: 400 });
  })

  it('gives a proper result after series of deposits down/up', async () => {
    const tester = await createTester(500);
    // Market drops 10%, we deposit $500 more.
    await tester.deposit(500, 90, 100000);
    // This means we have $500 @ 50c cushion,
    // and we have $500 @ 45c cushion.
    // At 45c, we should then have $500 + ($500 - 10%)
    expect(toFiat(tester.maxCovered, 45)).toEqual(950);

    await tester.deposit(500, 110, 100000);
    // Market up 10%, we deposit $500 more.
    // 500 @ 50c, 500 @ 45c, 500 @ 55c,
    // @45c = 500 + (500 * @50c * 0.9) + (500 @ 55c * 0.8181)
    expect(toFiat(tester.maxCovered, 45)).toEqual(1359.09);
  })

  it('gives a proper result after series of deposits up/down', async () => {
    // Identical to above, it should have the same result regardless of order of operations
    const tester = await createTester(500);
    await tester.deposit(500, 110, 100000);
    // $500 @ 50c, 500 @ 55c (validated by checking with toFiat)
    expect(toFiat(tester.maxCovered, 50)).toEqual(954.55);

    await tester.deposit(500, 90, 100000);
    expect(toFiat(tester.maxCovered, 45)).toEqual(1359.09);

  })

  it('correctly updates on withdraw and deposit', async () => {
    const tester = await createTester(1000);
    // Idempotent withdraw/deposit when rates are down
    await tester.withdraw(100, 90, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(900, 1);
    await tester.deposit(100, 90, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(1000, 1);

    // Idempotent withdraw/deposit when rates are up
    await tester.withdraw(100, 110, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(900, 1);
    await tester.deposit(100, 110, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(1000, 1);

    await tester.withdraw(100, 90, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(900, 1);
    await tester.deposit(50, 90, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(950, 1);
    await tester.deposit(50, 90, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(1000, 1);
  })

  it('generally works', async () => {
    const tester = await createTester(1000);
    // Idempotent withdraw/deposit when rates are down
    await tester.withdraw(100, 90, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(900, 1);
    await tester.withdraw(100, 110, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(800, 1);
    await tester.withdraw(100, 80, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(700, 1);

    await tester.deposit(100, 100, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(800, 1);
    await tester.deposit(100, 100, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(900, 1);

    // Idempotent withdraw/deposit when rates are up
    await tester.withdraw(100, 110, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(800, 1);
    await tester.deposit(100, 110, 100000);
    expect(toFiat(tester.maxCovered, 50)).toBeCloseTo(900, 1);
  })

  it('generally works after years', async () => {
    const tester = await createTester(1000);
    const r = await tester.drawDownCushion(1 * yearInMs);
    // As above, but testing that cushionDown is correct
    await tester.withdraw(100, 90, 100000);
    await testResults(tester, {year: 1, rate: 50,  fiat: 900 });
    await tester.withdraw(100, 110, 100000);
    await testResults(tester, {year: 1, rate: 50,  fiat: 800 });
    await tester.withdraw(100, 80, 100000);
    await testResults(tester, {year: 1, rate: 50,  fiat: 700 });
    await testResults(tester, {year: 1, rate: 25,  fiat: 350 });

    await tester.deposit(100, 100, 100000);
    await testResults(tester, {year: 1, rate: 50,  fiat: 800 });
    await tester.deposit(100, 100, 100000);
    await testResults(tester, {year: 1, rate: 50,  fiat: 900 });

    // Idempotent withdraw/deposit when rates are up
    await tester.withdraw(100, 110, 100000);
    await testResults(tester, {year: 1, rate: 50,  fiat: 800 });
    await tester.deposit(100, 110, 100000);
    await testResults(tester, {year: 1, rate: 50,  fiat: 900 });
  })
})


//////////////////////////////////////////////////////////////////////

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
