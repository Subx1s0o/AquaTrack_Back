import 'reflect-metadata';
import { initializeApp } from './app';
import { initMongoDB } from './global/db/initMongoDB';

async function bootstrap() {
  initializeApp();
  await initMongoDB();
}

bootstrap();
