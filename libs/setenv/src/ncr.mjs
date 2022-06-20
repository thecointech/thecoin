// NodeCustomResolver
import { resolve as resolve_ts, load as load_ts, getFormat, transformSource } from 'ts-node/esm/transpile-only';
/**
 * @param {string} specifier
 * @param {{
 *   conditions: string[],
 *   parentURL: string | undefined,
 * }} context
 * @param {Function} defaultResolve
 * @returns {Promise<{ url: string }>}
 */
export async function resolve(specifier, context, defaultResolve)
{
  // Always add our config to import conditions
  if (process.env.CONFIG_NAME ?? process.env.NODE_ENV) {
    return defaultResolve(specifier, {
      ...context,
      conditions: [...context.conditions, process.env.CONFIG_NAME || process.env.NODE_ENV],
    }, defaultResolve);
  }
  // Defer to Node.js for all other specifiers.
  return resolve_ts(specifier, context, defaultResolve);
}
