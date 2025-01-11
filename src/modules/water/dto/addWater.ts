import { IsNumber, IsDateString } from 'class-validator';

export class AddWaterDTO {
  // @IsString()
  // userId!: string;

  @IsNumber()
  volume!: number;

  @IsDateString()
  date!: string;
}
