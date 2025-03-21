/* eslint consistent-return:0 import/order:0 */
import { resolve } from 'path';
import express from 'express';
import { logger } from './logger.mjs';

import args from './argv.mjs';
import { port } from './port.mjs';
import { setup } from './middlewares/frontendMiddleware.mjs';

export async function run(secrets, clientSetup)
{
  const app = express();

  // if any client setup, do it before the default below overrides all paths
  if (clientSetup) {
    clientSetup(app);
  }

  // In production we need to pass these values in instead of relying on webpack
  await setup(
    secrets,
    app,
    {
      outputPath: resolve(process.cwd(), 'build'),
      publicPath: '/',
    }
  );

  // get the intended host and port number, use localhost and port 3000 if not provided
  const customHost = args.host || process.env.HOST;
  const host = customHost || null; // Let http.Server use its default IPv6/4 host
  const prettyHost = customHost || 'localhost';

  // use the gzipped bundle
  app.get('*.js', (req, res, next) => {

    req.url = req.url + '.gz'; // eslint-disable-line
    res.set('Content-Encoding', 'gzip');
    next();
  });

  app.get('*.js.map', (req, res, next) => {
    req.url = req.url + '.gz'; // eslint-disable-line
    res.set('Content-Encoding', 'gzip');
    next();
  });

  // Start your app.
  app.listen(port, host, async err => {
    if (err) {
      return logger.error(err.message);
    }

    // Connect to ngrok in dev mode
    logger.appStarted(port, prettyHost);
  });
}
