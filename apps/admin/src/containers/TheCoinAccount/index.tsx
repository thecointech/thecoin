import { TheCoinRoutes } from './Routes';
import { AccountId } from '@thecointech/signers';
import { AccountBase } from '../AccountBase';

export const TheCoin = () => <AccountBase id={AccountId.TheCoin} routes={TheCoinRoutes} />
