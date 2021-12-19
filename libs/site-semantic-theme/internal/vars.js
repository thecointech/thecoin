const path = require('path');
const siteBaseRoot = path.resolve(__dirname, '..');
const basePath = path.join(siteBaseRoot, 'src', 'semantic', 'na', 'na');

// Given a resource path, search up to find the owning 'src' path
const findSitePath = (fullPath) => {
  const parts = fullPath.split(path.sep);
  let idx = parts.lastIndexOf('src');
  if (idx < 0) idx = parts.length;
  return path.join(...parts.slice(0, idx), 'src', 'semantic');
}

// Vars to pass to LESS
module.exports = (resourcePath) => ({
  paths: [basePath],
  modifyVars: {
    projectRoot: `"${siteBaseRoot}"`,
    siteFolder: `"${findSitePath(resourcePath)}"`,
  }
})
