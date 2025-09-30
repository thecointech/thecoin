export  { default } from '../contract-tools/build/hardhat.config.old';

// GH Actions for whatever reason (don't care) doesn't parse the import statement above
module.exports = require('@thecointech/contract-tools/hardhat.config');
