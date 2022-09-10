import Decimal from 'decimal.js-light';
import { roundPlaces, toCoin, toCoinDecimal, toHuman, toHumanDecimal } from './Conversion';

const COIN_EXP = 6;

test('basic', () => {
	expect(Math.log10(toCoin(1))).toBe(COIN_EXP);
	expect(toCoinDecimal(new Decimal(1)).log(10).toNumber()).toBe(COIN_EXP);

	expect(toHuman(Math.pow(10, COIN_EXP))).toBe(1);
	expect(toHumanDecimal(new Decimal(10).pow(COIN_EXP)).toNumber()).toBe(1);

	const asCoin = toCoin(123.456789);
	expect(toHuman(asCoin, true)).toBe(123.46);

	expect(roundPlaces(123.456789)).toBe(123.46);
	expect(roundPlaces(123.456789, 4)).toBe(123.4568);

	expect(roundPlaces()).toBeUndefined();
  });
  