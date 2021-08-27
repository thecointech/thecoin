const { basename, join } = require('path');
const { existsSync } = require('fs');

function getEnvFiles(cfgName) {
  const filename = cfgName || process.env.CONFIG_NAME || (
    process.env.NODE_ENV == "production"
      ? "prod"
      : "development"
  );
  const files = [];
  // Does the user have files on the system
  const systemFolder = process.env.THECOIN_ENVIRONMENTS;
  if (systemFolder) {
    const systemFile = join(systemFolder, `${filename}.private.env`);
    if (existsSync(systemFile)) files.push(systemFile);
  }

  // If none found, is there any in the local repo folder?
  const repoFile = join(__dirname, '..', 'environments', `${filename}.public.env`);
  if (existsSync(repoFile)) files.push(repoFile);


  // None found, throw
  if (files.length == 0) {
    throw new Error(`Missing cfg files for: ${cfgName} (${repoFile})`);
  }

  // Beta versions share a lot with non-beta environments, so we merge them together
  if (cfgName.endsWith("beta")) {
    const nonBeta = getEnvFiles(cfgName.slice(0, -4))
    files.push(...getEnvFiles(nonBeta))
  }
}

// Load all environment files.
const de = require('dotenv')
const files = getEnvFiles();
files.forEach(path => de.config({path}))

//  Set default name for logging
if (!process.env.LOG_NAME) {
  const projectRoot = process.cwd();
  process.env.LOG_NAME = basename(projectRoot);
}

module.exports = {
  getEnvFile: getEnvFile
}
