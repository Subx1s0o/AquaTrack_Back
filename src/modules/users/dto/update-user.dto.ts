import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsEnum
} from 'class-validator';
enum GenderEnum {
  Male = 'male',
  Female = 'female',
  Other = 'other'
}
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
  @IsEnum(GenderEnum)
  gender?: 'male' | 'female' | 'other';

  @IsOptional()
  @IsNumber()
  dailyNorm?: number;
}
