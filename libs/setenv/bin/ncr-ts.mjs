// NodeCustomResolver
import { addConditions } from './conditions.mjs';
import { getIfMocked } from './mocking.mjs';
import path from "path";
import { readFileSync, statSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";

/**
 * @param {string} specifier
 * @param {{
 *   conditions: string[],
 *   parentURL: string | undefined,
 * }} context
 * @param {Function} defaultResolve
 * @returns {Promise<{ url: string }>}
 */

// Load tsconfig path mappings once at startup
let pathMappings = null;
let projectDir = null;

function loadTsConfig() {
  if (pathMappings !== null) return;

  try {
    const tsConfigPath = process.env.TS_NODE_PROJECT;
    if (!tsConfigPath) {
      console.warn('TS_NODE_PROJECT not set, path mappings will not work');
      pathMappings = {};
      return;
    }

    const configContent = readFileSync(tsConfigPath, 'utf-8');
    const config = JSON.parse(configContent);
    pathMappings = config.compilerOptions?.paths || {};
    projectDir = path.dirname(tsConfigPath);
  } catch (err) {
    console.warn('Failed to load tsconfig:', err.message);
    pathMappings = {};
  }
}

export async function resolve(specifier, context, defaultResolve) {
  const specOrMocked = getIfMocked(specifier, context.parentURL)?.toString() ?? specifier;

  // Apply path mappings if needed
  let resolvedSpec = specOrMocked;
  const isRemapped = specOrMocked.startsWith("@/");
  if (isRemapped) {
    resolvedSpec = applyTsPaths(specOrMocked);
  }

  // Add custom conditions for all resolutions
  const modifiedContext = addConditions(context);

  // Try default resolution first
  try {
    return await defaultResolve(resolvedSpec, modifiedContext, defaultResolve);
  } catch (err) {
    // If resolution failed and this looks like a relative/absolute path, try adding extensions
    if (isRemapped || resolvedSpec.startsWith('.') || resolvedSpec.startsWith('file://')) {
      const resolved = await tryExtensions(resolvedSpec, modifiedContext, defaultResolve);
      if (resolved) return resolved;
    }
    // Re-throw if we couldn't resolve it
    throw err;
  }
}

// Try common extensions for extensionless imports
async function tryExtensions(specifier, context, defaultResolve) {
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.mjs', '.cjs'];

  // If specifier is already a file URL, convert to path for manipulation
  let basePath = specifier;
  let isFileUrl = false;
  if (specifier.startsWith('file://')) {
    basePath = fileURLToPath(specifier);
    isFileUrl = true;
  }

  // Try each extension
  for (const ext of extensions) {
    try {
      const withExt = basePath + ext;
      const testSpec = isFileUrl ? pathToFileURL(withExt).href : withExt;
      return await defaultResolve(testSpec, context, defaultResolve);
    } catch {
      // Continue to next extension
    }
  }

  // Try as directory with index files
  for (const ext of extensions) {
    try {
      const indexPath = `${basePath}/index${ext}`;
      const testSpec = isFileUrl ? pathToFileURL(indexPath).href : indexPath;
      return await defaultResolve(testSpec, context, defaultResolve);
    } catch {
      // Continue to next extension
    }
  }

  return null;
}

// No load hook needed - Node handles .ts files natively with --experimental-transform-types

function applyTsPaths(specifier) {
  loadTsConfig();

  if (!pathMappings || !projectDir) {
    return specifier;
  }

  for (const [pattern, mappings] of Object.entries(pathMappings)) {
    // Handle wildcard patterns like "@/*"
    if (pattern.includes('*')) {
      // Convert pattern to regex-like matching
      const patternPrefix = pattern.replace('*', ''); // "@/*" -> "@/"

      if (specifier.startsWith(patternPrefix)) {
        // Extract the part that matches the wildcard
        const wildcardPart = specifier.slice(patternPrefix.length); // "@/errors" -> "errors"

        // Replace the wildcard in the mapping with the extracted part
        const mapping = mappings[0]; // "./src/*"
        const resolvedPath = mapping.replace('*', wildcardPart); // "./src/*" -> "./src/errors"

        return path.resolve(projectDir, resolvedPath);
      }
    }
    else {
      // Handle exact matches (no wildcards)
      if (specifier === pattern) {
        return path.resolve(projectDir, mappings[0]);
      }
    }
  }

  return specifier;
}
