import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDTO {
  @IsString()
  @IsNotEmpty()
  code!: string;
}
