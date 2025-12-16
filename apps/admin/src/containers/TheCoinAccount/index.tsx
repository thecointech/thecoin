import { AccountId } from '@thecointech/signers';
import { AccountBase } from '../AccountBase';
export { routesTheCoin } from './Routes';

export const TheCoin = () => <AccountBase id={AccountId.TheCoin} />
