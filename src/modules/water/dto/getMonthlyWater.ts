import { IsString } from 'class-validator';

export class GetMonthlyWaterDTO {
  @IsString()
  userId!: string;

  @IsString()
  month!: string;

  @IsString()
  year!: string;
}
