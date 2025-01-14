import { IsNumber, IsDateString, Matches } from 'class-validator';

export class EditWaterDTO {
  @Matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/, {
    message: 'time must be in the format HH:MM'
  })
  @IsDateString()
  time!: string;

  @IsNumber()
  amount!: number;
}
