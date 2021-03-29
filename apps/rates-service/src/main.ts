import express from 'express';
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './api/swagger.json';
import { DevLivePort, Service } from '@thecointech/utilities/ServiceAddresses';
import { init } from './init';
import cors from 'cors';

const app = express();
// enable cors
app.use(cors());

const port = process.env.PORT ?? DevLivePort(Service.RATES);

RegisterRoutes(app);

(async () => {
  await init();

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.listen(port, () => {
    console.log('Your server is listening on port %d (http://localhost:%d)', port, port);
    console.log('Swagger-ui is available on http://localhost:%d/docs', port);
  })
})()



// Initialize Swagger Express Middleware with our Swagger file
//let swaggerFile = path.join(__dirname, 'api', 'swagger.json');
// createMiddleware(swaggerFile, app, (_err, middleware) => {

//   // Add all the Swagger Express Middleware, or just the ones you need.
//   // NOTE: Some of these accept optional options (omitted here for brevity)
//   app.use(
//     middleware.metadata(),
//     middleware.CORS(),
//     middleware.files(),
//     middleware.parseRequest(),
//     middleware.validateRequest(),
//     middleware.mock()
//   );

//   // Start the app
//   app.listen(port, () => {
//     console.log(`The Broker API is now running at http://localhost:${port}`);
//   });
// });
