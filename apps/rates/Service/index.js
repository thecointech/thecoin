'use strict';

var fs = require('fs'),
  path = require('path'),
  http = require('http');

var RatesUpdate = require('./update/UpdateDb');

var app = require('express')();
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
const PORT = process.env.PORT || 8080;

// swaggerRouter configuration
var options = {
  swaggerUi: path.join(__dirname, '/swagger.json'),
  controllers: path.join(__dirname, './controllers'),
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(path.join(__dirname, 'api/swagger.yaml'), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

  // the app is behind a front-facing proxy, 
  // we use the X-Forwarded-* headers to determine 
  // the connection and the IP address of the client.
  // (Enabled in sample, but do we need it?)
  //app.enable('trust proxy');

  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // Expose an additional endpoint to allow triggering
  // an update.  This endpoint should be locked
  // down and only available to the cron job running on GAE
  app.get('/doUpdate', function (req, res) {
    RatesUpdate.UpdateRates()
      .then((success) => {
        res.status(200).end('success: ' + success);
      })
      .catch((err) => {
        res.status(405).end('unknown exception');
      });
  });

  // Start the server
  http.createServer(app).listen(PORT, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', PORT, PORT);
    console.log('Swagger-ui is available on http://localhost:%d/docs', PORT);
  });
});
