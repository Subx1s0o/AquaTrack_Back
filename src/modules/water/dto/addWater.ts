import { IsNumber, IsDateString } from 'class-validator';

export class AddWaterDTO {
  @IsNumber()
  amount!: number;

  @IsNumber()
  dailyNorm!: number;

  @IsDateString()
  date!: string;
}
