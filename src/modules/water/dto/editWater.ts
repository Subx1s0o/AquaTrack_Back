import { IsNumber, IsDateString } from 'class-validator';

export class EditWaterDTO {
  // @IsString()
  // userId!: string;

  @IsDateString()
  date!: string;

  @IsNumber()
  volume!: number;
}
