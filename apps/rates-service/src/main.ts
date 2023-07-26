import express, { NextFunction, Request, Response } from 'express';
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './api/swagger.json' assert {type: "json"};
import { init } from './init';
import cors from 'cors';
import { SendMail } from '@thecointech/email';
import { log } from '@thecointech/logging';

log.info(`Loading App: v${process.env.TC_APP_VERSION ?? process.env.npm_package_version} - ${process.env.CONFIG_NAME} (${process.env.NODE_ENV})`);

const app = express();
// enable cors
app.use(cors());

RegisterRoutes(app);

(async () => {
  await init();

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use(errorHandler);

  const port = process.env.PORT ?? process.env.PORT_SERVICE_RATES ?? 7001;
  app.listen(port, () => {
    console.log('Your server is listening on port %d (http://localhost:%d)', port, port);
    console.log('Swagger-ui is available on http://localhost:%d/docs', port);
  })
})()

//
// Until we get proper SEQ logging & reporting setup, make sure we notice any errors
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (err instanceof Error) {
    log.error(err, `Internal Error`);
    SendMail(`ERROR: Rates Service - ${process.env.CONFIG_NAME}`,
      `${req.url}\n\n${err.message}\n\n${err.stack}`
    );
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }

  next();
}
