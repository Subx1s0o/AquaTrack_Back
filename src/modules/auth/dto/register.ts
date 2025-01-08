// import { z } from 'zod';

import { IsEmail, IsString, IsStrongPassword } from "class-validator";

// export const RegisterDto = z.object({
//   email: z
//     .string()
//     .email('Invalid email address')
//     .nonempty('Email is required'),
//   password: z
//     .string()
//     .min(8, 'Password should be at least 8 characters')
//     .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
//     .regex(/[0-9]/, 'Password must contain at least one number')
//     .nonempty('Password is required')
// });

// export type RegisterDtoType = z.infer<typeof RegisterDto>;


export class RegisterDto {
  @IsString()
  @IsEmail()
  email!: string;

  @IsString()
  @IsStrongPassword()
  password!: string;
}