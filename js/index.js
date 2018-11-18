import { Convert } from './Conversion';
import TheContract from './TheContract';

const toCoin = Convert.prototype.toCoin;
const toHuman = Convert.prototype.toHuman;

export { toCoin, toHuman, TheContract };