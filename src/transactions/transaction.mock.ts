import { Transaction } from './transaction';
import { buyerUser, existingUser } from '../user/user.mock';
import { existingProduct, newProduct } from '../product/product.mock';

// calculating total spends since product costs may change in the future
export const buyerTx1:Transaction = {
  user: buyerUser,
  product: existingProduct,
  units: 5,
  totalSpent: existingProduct.cost * 5,
}

export const buyerTx2:Transaction = {
  user: buyerUser,
  product: existingProduct,
  units: 10,
  totalSpent: existingProduct.cost * 10,
}

export const buyerTx3:Transaction = {
  user: buyerUser,
  product: newProduct,
  units: 1,
  totalSpent: existingProduct.cost * 1,
}

export const otherBuyerTx1:Transaction = {
  user: existingUser,
  product: existingProduct,
  units: 2,
  totalSpent: existingProduct.cost * 2,
}