import { Entity } from '../common/entity';

export class Product extends Entity<string> {

  productName:string;
  cost:number;
  amountAvailable:number;
  sellerId:string;

}