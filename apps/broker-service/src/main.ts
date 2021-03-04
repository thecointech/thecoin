import express, {
  Response as ExResponse,
  Request as ExRequest,
  NextFunction,
} from "express";
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './api/swagger.json';
import { DevLivePort, Service } from '@the-coin/utilities/ServiceAddresses';
import { init } from './init';
import cors from 'cors';
import { ValidateError } from "tsoa";
import { log } from "@the-coin/logging";

const app = express();
app.use(cors());
//app.options('*', cors());
const port = process.env.PORT ?? DevLivePort(Service.BROKER);

RegisterRoutes(app);

(async () => {
  await init();

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use(errorHandler);
  app.use(notFoundHandler);

  app.listen(port, () => {
    console.log('Your server is listening on port %d (http://localhost:%d)', port, port);
    console.log('Swagger-ui is available on http://localhost:%d/docs', port);
  })
})()


export function notFoundHandler(_req: unknown, res: ExResponse) {
  res.status(404).send({
    message: "Not Found",
  });
};

export function errorHandler(
  err: unknown,
  req: ExRequest,
  res: ExResponse,
  next: NextFunction
): ExResponse | void {
  if (err instanceof ValidateError) {
    log.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(422).json({
      message: "Validation Failed",
      details: err?.fields,
    });
  }
  if (err instanceof Error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }

  next();
}
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
