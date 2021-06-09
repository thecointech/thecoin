import { Decimal } from 'decimal.js-light';

const Multiplier = 1000000;

function toCoin(val: number) : number {
	return Math.floor(val * Multiplier);
}

function toCoinDecimal(val: Decimal) : Decimal {
	return val.mul(Multiplier).toDecimalPlaces(0, Decimal.ROUND_DOWN);
}

function toHuman(val: number, doRound?: boolean): number {
	return doRound ?
		Math.round(val / 10000) / 100 :
		val / Multiplier;
}

function toHumanDecimal(val: Decimal) : Decimal {
	return val.div(Multiplier).toDecimalPlaces(2, Decimal.ROUND_DOWN);
}

function roundPlaces(value?: number, places?: number) {
	if (!value) return undefined;
	const sf = places ? Math.pow(10, places) : 100;
	return Math.round(value * sf) / sf;
}

export { toCoin, toCoinDecimal, toHuman, toHumanDecimal, roundPlaces }
