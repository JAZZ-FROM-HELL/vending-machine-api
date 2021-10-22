import { IsNotEmpty, IsOptional } from 'class-validator';

export class Change {
  @IsNotEmpty() cent5 = 0;
  @IsNotEmpty() cent10 = 0;
  @IsNotEmpty() cent20 = 0;
  @IsNotEmpty() cent50 = 0;
  @IsNotEmpty() cent100 = 0;
}