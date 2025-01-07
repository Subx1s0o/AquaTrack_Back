import { z } from 'zod';

export const LoginDto = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .nonempty('Email is required'),
  password: z
    .string()
    .min(1, 'Password are required')
    .nonempty('Password is required')
});

export type LoginDtoType = z.infer<typeof LoginDto>;
