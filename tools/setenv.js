const { basename, join } = require('path');
const { existsSync, readFileSync } = require('fs');
const de = require('dotenv')

const projectRoot = process.cwd();
const LOG_NAME = basename(projectRoot);

function getEnvFiles(cfgName) {
  const envName = cfgName || process.env.CONFIG_NAME || (
    process.env.NODE_ENV == "production"
      ? "prod"
      : "development"
  );
  const files = [];
  // Does the user have files on the system
  const systemFolder = process.env.THECOIN_ENVIRONMENTS;
  if (systemFolder) {
    const systemFile = join(systemFolder, `${envName}.private.env`);
    if (existsSync(systemFile)) files.push(systemFile);
  }

  // If none found, is there any in the local repo folder?
  const repoFile = join(__dirname, '..', 'environments', `${envName}.public.env`);
  if (existsSync(repoFile)) files.push(repoFile);


  // None found, throw
  if (files.length == 0) {
    throw new Error(`Missing cfg files for: ${cfgName} (${repoFile})`);
  }

  // Beta versions share a lot with non-beta environments, so we merge them together
  if (envName.endsWith("beta")) {
    const nonBeta = getEnvFiles(envName.slice(0, -4))
    files.push(...nonBeta)
  }
  return files;
}

function getEnvVars(cfgName) {
  const files = getEnvFiles(cfgName);
  return files
    .map(file => readFileSync(file))
    .reduce((acc, contents) => ({
    ...de.parse(contents),
    ...acc, // later files have lower priority, do not overwrite existing balues
  }), {
    LOG_NAME,
  });
}

function loadEnvVars(cfgName) {
  // Load all environment files.
  const files = getEnvFiles(cfgName);
  files.forEach(path => de.config({path}))

    //  Set default name for logging
  if (!process.env.LOG_NAME) {
    const projectRoot = process.cwd();
    process.env.LOG_NAME = LOG_NAME;
  }
}

// By default, load envVars
loadEnvVars();

module.exports = {
  getEnvFiles: getEnvFiles,
  getEnvVars: getEnvVars,
}
