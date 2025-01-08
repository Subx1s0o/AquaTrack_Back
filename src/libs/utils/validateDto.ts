import { BadRequestError, HttpError } from 'routing-controllers';
import { ZodError, ZodSchema } from 'zod';

export const validateBody = <T>(schema: ZodSchema<T>, body: T): T => {
  try {
    return schema.parse(body);
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      const errorList = err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message
      }));

      const badRequestError = new BadRequestError('Validation failed') as HttpError & {
        errors: Array<{ path: string; message: string }>}

      badRequestError['errors'] = errorList;

      throw badRequestError;
    }
    throw err;
  }
};
