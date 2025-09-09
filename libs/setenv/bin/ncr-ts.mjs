// NodeCustomResolver
// import { resolve as resolve_ts, load as load_ts } from 'ts-node/esm/transpile-only';
import { addConditions } from './conditions.mjs';
import { getIfMocked } from './mocking.mjs';
import path from "path";
import { create, createEsmHooks } from 'ts-node';
/**
 * @param {string} specifier
 * @param {{
 *   conditions: string[],
 *   parentURL: string | undefined,
 * }} context
 * @param {Function} defaultResolve
 * @returns {Promise<{ url: string }>}
 */

const service = create({
  transpileOnly: true,
});
const hooks = createEsmHooks(service);
export async function resolve(specifier, context, defaultResolve)
{
  const specOrMocked = getIfMocked(specifier, context.parentURL)?.toString() ?? specifier;

  const res = (
    specifier.includes("thecointech") ||
    specifier.startsWith(".") ||
    specifier.startsWith("@/")
  )
    // For our files we need to use the ts-node transpiler
    ? await resolveProjectFile(specOrMocked, addConditions(context), defaultResolve)
    // for everything else, just use the default
    : await defaultResolve(specOrMocked, context, defaultResolve);

  return res;
}

export async function load(resolvedUrl, context, next) {
  return hooks.load(resolvedUrl, context, next);
}

function resolveProjectFile(specifier, context, defaultResolve) {
  if (specifier.startsWith("@/")) {
    specifier = applyTsPaths(specifier);
  }
  return hooks.resolve(specifier, addConditions(context), defaultResolve)
}

const pathMappings = service.config.options.paths;
const projectDir = path.dirname(service.configFilePath);
function applyTsPaths(specifier) {
  // Our TS config should be here
  if (pathMappings) {
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
          return mappings[0];
        }
      }
    }
  }
  return specifier;
}
