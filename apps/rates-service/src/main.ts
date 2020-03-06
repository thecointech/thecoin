import express from 'express';
import { RegisterRoutes } from './routes/routes';
//import createMiddleware from 'swagger-express-middleware';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './api/swagger.json';

const app = express();
const port = 4000;

RegisterRoutes(app);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => console.log(`Server started listening to port ${port}`));

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