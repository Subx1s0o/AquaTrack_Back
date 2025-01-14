import express from 'express';

import {
  getMetadataArgsStorage,
  useContainer,
  useExpressServer
} from 'routing-controllers';
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

const routingControllersOptions = {
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
};

export const initializeApp = (): express.Application => {
  const app = express();

  useContainer(Container);

  const config = Container.get(ConfigService);
  const logger = Container.get(Logger);
  Container.set('logger', logger);
  const PORT = config.get('PORT', '3000');

  app.use(express.json());
  app.use(cookieParser());

  useExpressServer(app, routingControllersOptions);

  const schemas = validationMetadatasToSchemas({
    refPointerPrefix: '#/components/schemas/'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

  const storage = getMetadataArgsStorage();
  const spec = routingControllersToSpec(storage, routingControllersOptions, {
    components: {
      schemas
    },
    info: {
      description: 'Generated with `routing-controllers-openapi`',
      title: 'API Documentation',
      version: '1.0.0'
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  app.use('/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(spec));

  app.use('*', notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    logger.log(`Server running on port ${PORT}`);
  });

  return app;
};
