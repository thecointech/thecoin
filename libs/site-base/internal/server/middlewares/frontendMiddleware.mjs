/* eslint-disable global-require */

/**
 * Front-end middleware
 */
export async function setup(app, options) {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    const { addProdMiddlewares } = await import('./addProdMiddlewares.mjs');
    addProdMiddlewares(app, options);
  } else {
    const { addDevMiddlewares } = await import('./addDevMiddlewares.mjs');
    const config = await import('../../webpack/webpack.dev.mjs')
    addDevMiddlewares(app, config.default);
  }

  return app;
};
