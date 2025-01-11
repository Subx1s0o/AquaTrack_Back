import { IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  avatarURL?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  activeTime?: number;

  @IsOptional()
  @IsString()
  gender?: 'male' | 'female' | 'other';

  @IsOptional()
  @IsNumber()
  dailyNorm?: number;
}
