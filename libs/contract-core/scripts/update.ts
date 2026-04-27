import { getSecret } from '@thecointech/secrets';

// Load secrets into env before Hardhat config is evaluated
process.env.INFURA_PROJECT_ID = await getSecret("InfuraProjectId");

// Now safe to import Hardhat (triggers config resolution)
await import('./update.impl');
