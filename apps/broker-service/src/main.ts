import express, {
  Response as ExResponse,
  Request as ExRequest,
  NextFunction,
} from "express";
import bodyParser from "body-parser";
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './api/swagger.json' with { type: "json" }
import { init } from './init';
import cors from 'cors';
import { ValidateError } from "@tsoa/runtime";
import { log } from "@thecointech/logging";
import { ValidateErrorJSON } from "./types";

const app = express();
// enable cors
app.use(cors());

// Use body parser to read sent json payloads
// otherwise nothing is recieved in body
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({
  verify:(req,_res,buf) => {
    // @ts-ignore
    req.rawBody=buf
  }
}));
RegisterRoutes(app);

(async () => {
  await init();

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use(errorHandler);
  app.use(notFoundHandler);

  const port = process.env.PORT ?? process.env.PORT_SERVICE_BROKER ?? 7002;
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
    log.warn(
      { err, fields: err?.fields, path: req.path, params: req.params, body: req.body},
      'Validation error on {path}: {fields}'
    );
    const r: ValidateErrorJSON = {
      message: "Validation failed",
      details: err?.fields,
    }
    return res.status(422).json(r);
  }
  if (err instanceof Error) {
    log.error(
      { err, path: req.path, params: req.params, body: req.body},
      "Error on {path} with Params: {params}, Body: {body}"
    );
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }

  next();
}
