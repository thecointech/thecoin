const logging = require('@thecointech/logging');
const path = require('path');

var cwd = process.cwd();
var name = cwd.split(path.sep).pop();
//var name = path.split(process.cwd())
logging.init(`${name}-jest`, 40);
