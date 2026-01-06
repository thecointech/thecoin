import * as path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const siteBaseRoot = path.resolve(dirname, '..');
const basePath = path.join(siteBaseRoot, 'src', 'semantic', 'na', 'na');

// Minimum depth of our repo
const repoPathDepth = path.join(siteBaseRoot, '..', '..').split(path.sep).length;

// Given a resource path, search up to find the owning 'src' path
const findSitePath = (fullPath: string): string | false => {
  const split = fullPath.split(path.sep);
  const idx = split.lastIndexOf('src');
  // Limit to within our repo
  if (idx < repoPathDepth) return false;
  return split.slice(0, idx).join(path.sep);
}

const getSemanticPath = (rsrcPath: string): string  => {
  const sitePath = findSitePath(rsrcPath) || process.cwd();
  return path.join(sitePath, 'src', 'semantic');
}

export interface LessVars {
  paths: string[];
  modifyVars: {
    projectRoot: string;
    siteFolder: string;
  };
}

// Vars to pass to LESS
export const vars = (resourcePath: string): LessVars => ({
  paths: [basePath],
  modifyVars: {
    projectRoot: `"${siteBaseRoot}"`,
    siteFolder: `"${getSemanticPath(resourcePath)}"`,
  }
});
