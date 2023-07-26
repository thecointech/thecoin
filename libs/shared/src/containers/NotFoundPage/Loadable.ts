/**
 * Asynchronously loads the component for NotFoundPage
 */

import { loadable } from '../../utils/loadable';

export const NotFoundPageLoadable = loadable(async () => {
  const c = await import('./index')
  return { default: c.NotFoundPage };
});
