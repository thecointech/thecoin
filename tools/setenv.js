const { join } = require('path');
const { existsSync } = require('fs');

function getEnvFile(cfgName) {
  const filename = cfgName || process.env.CONFIG_NAME || "development";
  const cfgFile = join(__dirname, '..', 'environments', `${filename}.env`);
  if (!existsSync(cfgFile)) {
    throw new Error(`Missing cfg file for: ${cfgName} (${cfgFile})`);
  }
  return cfgFile;
}

require('dotenv').config({path: getEnvFile()});

module.exports = {
  getEnvFile: getEnvFile
}
