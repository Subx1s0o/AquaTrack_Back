import 'reflect-metadata';
import { initializeApp } from './app';
import { initMongoDB } from '@/libs/db';

async function bootstrap(): Promise<void> {
  initializeApp();
  await initMongoDB();
}

bootstrap();
