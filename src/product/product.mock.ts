import { Product } from './product';
import { sellerUser } from '../user/user.mock';

export const existingProduct:Product = {
  productName:'Hummus Dip',
  cost:125,
  amountAvailable: 5,
  sellerId: sellerUser.username,
}

export const newProduct:Product = {
  productName:'Falafel Ball',
  cost:230,
  amountAvailable: 15,
  sellerId: sellerUser.username,
}

