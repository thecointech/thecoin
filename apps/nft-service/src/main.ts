import express, {
  Response as ExResponse,
  Request as ExRequest,
  NextFunction,
} from "express";
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './api/swagger.json' with { type: "json" }
import { init } from './init';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ValidateError } from "@tsoa/runtime";
import { log } from "@thecointech/logging";

const port = process.env.PORT ?? process.env.PORT_SERVICE_NFT ?? 7003;

const app = express();
// Set Secure Headers with Helmet
app.use(helmet());
// enable cors (TODO: Whitelist this)
app.use(cors());
// Use body parser to read sent json payloads
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
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
    log.error(err, `Internal Error for ${req.path}`);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }

  next();
}
