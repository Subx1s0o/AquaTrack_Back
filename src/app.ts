import express from 'express';

import { useContainer, useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';
import { configDotenv } from 'dotenv';
import { errorHandler, notFoundHandler } from '../libs/middlewares';
import { Logger, ConfigService } from '@/libs/global';
import cookieParser from 'cookie-parser';
import { authorizationChecker } from '@/libs/utils/authorizationChecker';
import { userChecker } from '@/libs/utils/userChecker';
import AuthController from './modules/auth/auth.controller';
import WaterController from './modules/water/water.controller';
configDotenv();
console.clear();

export const initializeApp = (): express.Application => {
  const app = express();

  useContainer(Container);

  const config = Container.get(ConfigService);
  const logger = Container.get(Logger);
  Container.set('logger', logger);
  const PORT = config.get('PORT', '3000');

  app.use(express.json());
  app.use(cookieParser());

  useExpressServer(app, {
    cors: {
      credentials: true,
      origin: '*',
      methods: 'GET,PUT,PATCH,POST,DELETE'
    },
    controllers: [AuthController, WaterController,],
    defaultErrorHandler: false,
    validation: true,
    currentUserChecker: userChecker,
    authorizationChecker: authorizationChecker
  });

  app.use('*', notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    logger.log(`Server running on port ${PORT}`);
  });

  return app;
};
