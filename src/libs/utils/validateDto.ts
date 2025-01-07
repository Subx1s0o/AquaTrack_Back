import { ZodSchema } from 'zod';

export const validateBody = <T>(schema: ZodSchema<T>, body: T): T => {
  try {
    return schema.parse(body);
  } catch (err: unknown) {
    throw err;
  }
};
