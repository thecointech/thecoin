const { join } = require('path');
const { existsSync } = require('fs');

function getEnvFile(cfgName) {
  const filename = cfgName || process.env.CONFIG_NAME || "development";
  // Prefer built-in
  const repoFile = join(__dirname, '..', 'environments', `${filename}.env`);
  if (existsSync(repoFile)) return repoFile;
  // Does the user have files on the system
  const systemFolder = process.env.THECOIN_ENVIRONMENTS;
  if (systemFolder) {
    const systemFile = join(systemFolder, `${filename}.env`);
    if (existsSync(systemFile)) return systemFile;
  }
  // None found, throw
  throw new Error(`Missing cfg file for: ${cfgName} (${cfgFile})`);
}

require('dotenv').config({path: getEnvFile()});

module.exports = {
  getEnvFile: getEnvFile
}
