//
// The MJS exports of error-overlay use require, and aren't valid
// in a module.  Shimming with a .js file forces us to import cjs version
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')

module.exports = ErrorOverlayPlugin;
