import { IsString, IsDateString } from 'class-validator';

export class GetDailyWaterDTO {
  @IsString()
  userId!: string;

  @IsDateString()
  date!: string;
}
