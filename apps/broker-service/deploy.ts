import { gCloudDeploy, removeOldAppVersions } from '../../tools/predeploy';
import { predeploy } from './predeploy';

await predeploy();
await gCloudDeploy();
// Clean-up after
await removeOldAppVersions();
