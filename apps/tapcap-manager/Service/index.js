'use strict';

require = require("esm")(module/*, options*/)

var fs = require('fs'),
    path = require('path'),
    http = require('http');

var app = require('express')();
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var cors = require('cors')

var watcher = require('./tapcap/DepositWatcher');
const { DecryptWallet } = require('./tapcap/Wallet');

const PORT = process.env.PORT || 8091;

// swaggerRouter configuration
var options = {
  swaggerUi: path.join(__dirname, '/swagger.json'),
  controllers: path.join(__dirname, './controllers'),
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(path.join(__dirname,'api/swagger.yaml'), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

console.log('Ready to init Middleware');

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, async (middleware) => {

  app.use(cors());
  app.options('*', cors()) // include before other routes

  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // Start the server
  await DecryptWallet();

  http.createServer(app).listen(PORT, function () {
    console.log('Your server is listening on port %d (http://localhost:%d)', PORT, PORT);
    console.log('Swagger-ui is available on http://localhost:%d/docs', PORT);
  });
});

// Start watching for ethereum events
watcher.WatchTapCapDeposits();
