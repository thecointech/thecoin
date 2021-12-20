const path = require('path');
const siteBaseRoot = path.resolve(__dirname, '..');
const basePath = path.join(siteBaseRoot, 'src', 'semantic', 'na', 'na');

// Given a resource path, search up to find the owning 'src' path
const findSitePath = (fullPath) => {
  const parsed = path.parse(fullPath);
  if (parsed.base == 'src') return parsed.dir;
  return findSitePath(parsed.dir);
}

// Vars to pass to LESS
module.exports = (resourcePath) => ({
  paths: [basePath],
  modifyVars: {
    projectRoot: `"${siteBaseRoot}"`,
    siteFolder: `"${path.join(findSitePath(resourcePath), 'src', 'semantic')}"`,
  }
})
