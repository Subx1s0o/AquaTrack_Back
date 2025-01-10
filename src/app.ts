import express from 'express';
import path from 'path';
import { useContainer, useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';
import { configDotenv } from 'dotenv';
import { errorHandler, notFoundHandler } from '../libs/middlewares';
import { Logger, ConfigService } from '@/libs/global';
import cookieParser from 'cookie-parser';
configDotenv();
console.clear();

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
    controllers: [path.join(__dirname, './modules/**/*.controller.ts')],
    defaultErrorHandler: false,
    validation: true
    // currentUserChecker:  () => {}, Імплементувати логіку діставання юзера сюди
    // authorizationChecker: () => {} Імплементувати логіку перевірка авторизаційного токену сюди
  });

  app.use('*', notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    logger.log(`Server running on port ${PORT}`);
  });

  return app;
};
