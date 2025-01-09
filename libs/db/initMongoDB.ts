import mongoose from 'mongoose';
import { Logger, ConfigService } from '@/libs/global';
import { InternalServerError } from 'routing-controllers';
import { Container } from 'typedi';

export const initMongoDB = async (): Promise<void> => {
  const config = Container.get(ConfigService);
  const logger = Container.get(Logger);
  try {
    const user: string = config.get('MONGODB_USER');
    const pwd: string = config.get('MONGODB_PASSWORD');
    const url: string = config.get('MONGODB_URL');
    const db: string = config.get("MONGODB_DB")

    await mongoose.connect(
      `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority`
    );

    logger.log('Mongo connection successfully established!');
  } catch (e: unknown) {
    if (e instanceof Error) {
      logger.error(`Error while setting up mongo connection`);
      throw new InternalServerError(e.message);
    }
  }
};
