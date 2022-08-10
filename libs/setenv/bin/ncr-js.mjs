// NodeCustomResolver

import { getConditions } from "./conditions.mjs";

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
  return defaultResolve(specifier, {
    ...context,
    conditions: getConditions(context),
  }, defaultResolve)
}
