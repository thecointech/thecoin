import { toCoin, toHuman } from './Conversion';

const COIN_EXP = 6;

test('basic', () => {
	expect(Math.log10(toCoin(1))).toBe(COIN_EXP);

	expect(toHuman(Math.pow(10, COIN_EXP))).toBe(1);
  });
  