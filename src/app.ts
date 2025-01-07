import 'reflect-metadata';
import express from 'express';
import path from 'path';
import { useContainer, useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';
import { configDotenv } from 'dotenv';
import { errorHandler, notFoundHandler } from '@/libs/middlewares';
import { Logger, ConfigService } from '@/global';

configDotenv();
console.clear();

export const initializeApp = () => {
  const app = express();

  useContainer(Container);

  const config = Container.get(ConfigService);
  const logger = Container.get(Logger);

  const PORT = config.get('PORT', '3000');

  app.use(express.json());

  useExpressServer(app, {
    controllers: [path.join(__dirname, './modules/**/*.controller.ts')],
    defaultErrorHandler: false,
    middlewares: [],
    interceptors: [],
    validation: false
  });

  app.use('*', notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    logger.log(`Server running on port ${PORT}`);
  });

  return app;
};
