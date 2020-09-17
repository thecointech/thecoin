const logging = require('@the-coin/logging');
const path = require('path');

var cwd = process.cwd();
console.log(cwd);
var name = cwd.split(path.sep).pop();
//var name = path.split(process.cwd())
logging.init(`${name}-jest`);