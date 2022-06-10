// NodeCustomResolver

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
  return defaultResolve(specifier, context, defaultResolve);
}
