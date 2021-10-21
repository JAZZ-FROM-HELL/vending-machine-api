import { User } from './user';
import { Role } from '../auth/role.enum';
import { Change } from './change';

export const existingUser:User = {
  username: 'john',
  password: 'changeme',
  role: Role.BUYER,
};

export const newUser:User = {
  username: 'martin',
  password: 'whatsthat',
  role: Role.SELLER,
}

export const sellerUser:User = {
  username: 'maria',
  password: 'guess',
  role: Role.SELLER,
}

export const buyerUser:User = {
  username: 'pierre',
  password: 'noneofyourbiz',
  deposit: new Change(),
  role: Role.BUYER
}
