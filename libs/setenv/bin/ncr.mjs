// NodeCustomResolver
import { resolve as resolve_ts, load as load_ts } from 'ts-node/esm/transpile-only';
import { getIfMocked } from './mocking.mjs';

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
  const specOrMocked = getIfMocked(specifier) ?? specifier;
  // Always add our config to import conditions
  return resolve_ts(specOrMocked, {
    ...context,
    conditions: [...context.conditions, process.env.CONFIG_NAME || process.env.NODE_ENV],
  }, defaultResolve);
}

export async function load(resolvedUrl, context, next) {
  return load_ts(resolvedUrl, context, next);
}
