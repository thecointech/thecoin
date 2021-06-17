const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const nocache = require('nocache')

function createWebpackMiddleware(compiler, publicPath) {
  return webpackDevMiddleware(compiler, {
    publicPath,
    stats: 'errors-only',
  });
}

module.exports = function addDevMiddlewares(app, webpackConfig) {
  const compiler = webpack(webpackConfig);
  const middleware = createWebpackMiddleware(
    compiler,
    webpackConfig.output.publicPath,
  );

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  // disable caching completely on development builds
  app.use(nocache());
};
