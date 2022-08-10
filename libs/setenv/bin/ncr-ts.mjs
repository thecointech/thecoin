// NodeCustomResolver
import { resolve as resolve_ts, load as load_ts } from 'ts-node/esm/transpile-only';
import { getConditions } from './conditions.mjs';
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
  const specOrMocked = getIfMocked(specifier, context.parentURL)?.toString() ?? specifier;

  const res = (specifier.includes("thecointech") || specifier.startsWith("."))
    // For our files we need to use the ts-node transpiler
    ? await resolve_ts(specOrMocked, {
      ...context,
      conditions: getConditions(context),
    }, defaultResolve)
    // for everything else, just use the default
    : await defaultResolve(specOrMocked, context, defaultResolve);

  return res;
}

export async function load(resolvedUrl, context, next) {
  return load_ts(resolvedUrl, context, next);
}
