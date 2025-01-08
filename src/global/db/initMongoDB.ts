import mongoose from 'mongoose';
import { getEnvVar } from '../../libs/utils/getEnvVar';

export const initMongoDB = async (): Promise<void> => {
  try {
    const user: string = getEnvVar('MONGODB_USER');
    const pwd: string = getEnvVar('MONGODB_PASSWORD');
    const url: string = getEnvVar('MONGODB_URL');

    await mongoose.connect(
      `mongodb+srv://${user}:${pwd}@${url}/?retryWrites=true&w=majority`,
    );

    console.log('Mongo connection successfully established!');
  } catch (e: unknown) {
    console.error('Error while setting up mongo connection', e);
    throw e;
  }
};