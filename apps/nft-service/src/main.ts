import express from 'express';
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './api/swagger.json';
import { init } from './init';
import cors from 'cors';
;

const app = express();
// enable cors
app.use(cors());
const port = process.env.PORT ?? 9009;

RegisterRoutes(app);

(async () => {
  await init();

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.listen(port, () => {
    console.log('Your server is listening on port %d (http://localhost:%d)', port, port);
    console.log('Swagger-ui is available on http://localhost:%d/docs', port);
  })
})()
