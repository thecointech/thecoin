//var variables = require('!!../../../../tools/less-var-loader!./variables.less');
// We can't type this, you just have to look it up in source!
const LessVars = require('less-vars-loader?resolveVariables!./semantic/globals/site.variables');
module.exports = {
  LessVars: LessVars
}
