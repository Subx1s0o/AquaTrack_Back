import { IsNumber, Matches } from 'class-validator';

export class AddWaterDTO {
  @Matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/, {
    message: 'time must be in the format HH:MM'
  })
  time!: string;

  @IsNumber()
  amount!: number;

  @IsNumber()
  dailyNorm!: number;

  @Matches(/^(\d{4})-(\d{2})-(\d{2})$/, {
    message: 'date must be in the format YYYY-MM-DD'
  })
  date!: string;
}
