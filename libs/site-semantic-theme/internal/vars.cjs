const path = require('path');
const siteBaseRoot = path.resolve(__dirname, '..');
const basePath = path.join(siteBaseRoot, 'src', 'semantic', 'na', 'na');

// Minimum depth of our repo
const repoPathDepth = path.join(siteBaseRoot, '..', '..').split(path.sep).length;

// Given a resource path, search up to find the owning 'src' path
const findSitePath = (fullPath, basePath) => {
  const split = fullPath.split(path.sep);
  const idx = split.lastIndexOf('src');
  // Limit to within our repo
  if (idx < repoPathDepth) return false;
  return split.slice(0, idx).join(path.sep);
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
