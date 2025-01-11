import express from 'express';

import { getMetadataArgsStorage, useContainer, useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';
import { configDotenv } from 'dotenv';
import { errorHandler, notFoundHandler } from '../libs/middlewares';
import { Logger, ConfigService } from '@/libs/global';
import cookieParser from 'cookie-parser';
import { authorizationChecker } from '@/libs/utils/authorizationChecker';
import { userChecker } from '@/libs/utils/userChecker';
import AuthController from './modules/auth/auth.controller';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import * as swaggerUiExpress from 'swagger-ui-express';

configDotenv();
console.clear();
const { defaultMetadataStorage } = require('class-transformer/cjs/storage')
const routingControllersOptions = {
  controllers: [AuthController]
}

export const initializeApp = (): express.Application => {
  const app = express();

  useContainer(Container);

  const config = Container.get(ConfigService);
  const logger = Container.get(Logger);

  const PORT = config.get('PORT', '3000');

  app.use(express.json());
  app.use(cookieParser());

  useExpressServer(app, {
    cors: {
      credentials: true,
      origin: '*',
      methods: 'GET,PUT,PATCH,POST,DELETE'
    },
    controllers: [AuthController],
    defaultErrorHandler: false,
    validation: true,
    currentUserChecker: userChecker,
    authorizationChecker: authorizationChecker
  });

  // Parse class-validator classes into JSON Schema
  const schemas = validationMetadatasToSchemas({
    classTransformerMetadataStorage: defaultMetadataStorage,
    refPointerPrefix: '#/components/schemas/',
  });


  // Parse routing-controllers classes into OpenAPI spec
  const storage = getMetadataArgsStorage();
  const spec = routingControllersToSpec(storage, routingControllersOptions, {
    components: {
      schemas,
      securitySchemes: {
        basicAuth: {
          scheme: 'basic',
          type: 'http',
        },
      },
    },
    info: {
      description: 'Generated with `routing-controllers-openapi`',
      title: 'API Documentation',
      version: '1.0.0',
    },
  });

  // Serve Swagger UI
 app.use('/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(spec))

// Render spec on root:
app.get('/', (_req, res) => {
  res.json(spec)
})

  app.use('*', notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    logger.log(`Server running on port ${PORT}`);
  });

  return app;
};
