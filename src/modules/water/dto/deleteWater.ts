import { IsString, IsDateString } from 'class-validator';

export class DeleteWaterDTO {
  // @IsString()
  // userId!: string;

  @IsDateString()
  date!: string;
}
