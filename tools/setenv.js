const { join } = require('path');
const { existsSync } = require('fs');

function getEnvFile(cfgName) {
  const filename = cfgName || process.env.CONFIG_NAME || "development";
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
  throw new Error(`Missing cfg file for: ${cfgName} (${cfgFile})`);
}

require('dotenv').config({path: getEnvFile()});

module.exports = {
  getEnvFile: getEnvFile
}
