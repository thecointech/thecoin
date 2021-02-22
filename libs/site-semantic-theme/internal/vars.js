const path = require('path');
const siteBaseRoot = path.resolve(__dirname, '..');

// Vars to pass to LESS
module.exports = {
  paths: [
    path.join(siteBaseRoot, 'src', 'semantic', 'na', 'na'),
  ],
  modifyVars: {
    projectRoot: `"${siteBaseRoot}"`,
    // We use the CWD to find the path to the currently compiling project
    siteFolder: `"${path.join(process.cwd(), 'src', 'semantic')}"`,
  }
}
