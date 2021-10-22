import { Entity } from '../common/entity';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class Product extends Entity<string> {

  @IsNotEmpty()
  productName:string;

  @IsInt()
  @IsPositive()
  cost:number;

  @IsInt()
  @IsPositive()
  amountAvailable:number;

  @IsNotEmpty()
  sellerId:string;

}