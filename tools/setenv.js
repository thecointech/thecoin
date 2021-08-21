const { basename, join } = require('path');
const { existsSync } = require('fs');

function getEnvFile(cfgName) {
  const filename = cfgName || process.env.CONFIG_NAME || (
    process.env.NODE_ENV == "production"
      ? "prod"
      : "development"
  );

  // Does the user have files on the system
  const systemFolder = process.env.THECOIN_ENVIRONMENTS;
  if (systemFolder) {
    const systemFile = join(systemFolder, `${filename}.env`);
    if (existsSync(systemFile)) return systemFile;
  }

  // If none found, is there any in the local repo folder?
  const repoFile = join(__dirname, '..', 'environments', `${filename}.env`);
  if (existsSync(repoFile)) return repoFile;

  // None found, throw
  throw new Error(`Missing cfg file for: ${cfgName} (${repoFile})`);
}

require('dotenv').config({path: getEnvFile()});

// Our CONFIG_ENV is the CONFIG_NAME without a beta.
// This is mostly to give us an env variable that drops
// the 'beta' tag so it can be beta-agnostic
// (ie - for contract address etc.)
process.env.CONFIG_ENV = process.env.CONFIG_NAME.match(/(.*)beta/)?.[1] ?? process.env.CONFIG_NAME

//  Set default name for logging
if (!process.env.LOG_NAME) {
  const projectRoot = process.cwd();
  process.env.LOG_NAME = basename(projectRoot);
}

module.exports = {
  getEnvFile: getEnvFile
}
