import mongoose from 'mongoose';
import { Logger, ConfigService } from '@/global';
import { useContainer, InternalServerError } from 'routing-controllers';
import { Container } from 'typedi';

  useContainer(Container);

  const config = Container.get(ConfigService);
  const logger = Container.get(Logger);


export const initMongoDB = async (): Promise<void> => {
  try {
    const user: string = config.get('MONGODB_USER', "");
    const pwd: string = config.get('MONGODB_PASSWORD', "");
    const url: string = config.get('MONGODB_URL', "");

    await mongoose.connect(
      `mongodb+srv://${user}:${pwd}@${url}/?retryWrites=true&w=majority`,
    );

    logger.log('Mongo connection successfully established!');
  } catch (e: unknown) {
    logger.error(`Error while setting up mongo connection, ${e}`);
    if (e instanceof Error) {
        throw new InternalServerError(`error: ${e.message}`);
      } else {
        throw new InternalServerError(`Unknown error: ${JSON.stringify(e)}`);
      }
  }
};