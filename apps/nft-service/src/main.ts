import express from 'express';
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './api/swagger.json';
import { init } from './init';
import cors from 'cors';
import bodyParser from 'body-parser';

const port = process.env.PORT ?? process.env.PORT_SERVICE_NFT ?? 7003;

const app = express();
// DC fix: Don't post powered-by cause less info exposed is better.
// (ironic, for an OS project ;-) )
app.disable('x-powered-by');
// enable cors
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

  app.listen(port, () => {
    console.log('Your server is listening on port %d (http://localhost:%d)', port, port);
    console.log('Swagger-ui is available on http://localhost:%d/docs', port);
  })
})()
