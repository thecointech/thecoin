const { join } = require('path');
const { existsSync } = require('fs');

const cfgName = process.env.CONFIG_NAME || "development";
const cfgFile = join(__dirname, '..', 'environments', `${cfgName}.env`);
if (!existsSync(cfgFile)) {
  throw new Error(`Missing cfg file for: ${cfgName} (${cfgFile})`);
}
require('dotenv').config({path: cfgFile});
