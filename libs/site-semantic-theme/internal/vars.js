const path = require('path');
const siteBaseRoot = path.resolve(__dirname, '..');
const basePath = path.join(siteBaseRoot, 'src', 'semantic', 'na', 'na');

// Given a resource path, search up to find the owning 'src' path
const findSitePath = (fullPath) => {
  const parsed = path.parse(fullPath);
  if (parsed.base == 'src') return parsed.dir;
  if (!parsed.dir) return false;
  return findSitePath(parsed.dir);
}

const getSemanticPath = (rsrcPath)  => {
  const sitePath = findSitePath(rsrcPath) || process.cwd();
  return path.join(sitePath, 'src', 'semantic');
}

// Vars to pass to LESS
module.exports = (resourcePath) => ({
  paths: [basePath],
  modifyVars: {
    projectRoot: `"${siteBaseRoot}"`,
    siteFolder: `"${getSemanticPath(resourcePath)}"`,
  }
})
