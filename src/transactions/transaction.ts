import { User } from '../user/user';
import { Product } from '../product/product';

export class Transaction {
  id?:number;
  user:User;
  product:Product;
  units:number;
  totalSpent:number; // since product cost may change in the future
}