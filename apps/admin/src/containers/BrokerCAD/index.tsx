import { AccountId } from '@thecointech/signers';
import { AccountBase } from '../AccountBase';
import { BrokerCADRoutes } from './Routes';

export const BrokerCAD = () => <AccountBase id={AccountId.BrokerCAD} routes={BrokerCADRoutes} />


