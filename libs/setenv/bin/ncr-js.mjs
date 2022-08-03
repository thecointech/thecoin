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
  return defaultResolve(specifier, {
    ...context,
    conditions: [process.env.CONFIG_NAME || process.env.NODE_ENV, ...context.conditions],
  }, defaultResolve)
}
