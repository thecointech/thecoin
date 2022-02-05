import { Decimal } from 'decimal.js-light';

export const zero = new Decimal(0);
export const one = new Decimal(1);
// export const DMin = (l: Decimal, r: Decimal) => l.lt(r) ? l : r;
export const DMin = (l: Decimal, r: Decimal) => l.lt(r) ? l : r;
