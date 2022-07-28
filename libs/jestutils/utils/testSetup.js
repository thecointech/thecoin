const path = require('path');

// Hide debug logging
var cwd = process.cwd();
var name = cwd.split(path.sep).pop();
process.env.LOG_NAME = `${name}-jest`;
process.env.LOG_LEVEL = 40
