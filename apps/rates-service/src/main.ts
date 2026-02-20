import express from 'express';
import { RegisterRoutes } from './routes/routes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './api/swagger.json' with {type: "json"};
import { init } from './init';
import cors from 'cors';
import { errorHandler, requestIdMiddleware } from './middlewares';

const app = express();

// Initialize data sources & secrets
await init();

// Standard middleware
app.use(cors());
app.use(requestIdMiddleware);

// API Routes
RegisterRoutes(app);

// Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling (Must be after routes)
app.use(errorHandler);

const port = process.env.PORT ?? process.env.PORT_SERVICE_RATES ?? 7001;
app.listen(port, () => {
  console.log('Your server is listening on port %d (http://localhost:%d)', port, port);
  console.log('Swagger-ui is available on http://localhost:%d/docs', port);
});

