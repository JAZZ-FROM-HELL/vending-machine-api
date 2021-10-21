import { Role } from '../auth/role.enum';
import { Entity } from '../common/entity';
import { Change } from './change';


export class User extends Entity<string> {

  username:string;
  password:string;
  deposit?:Change = new Change();
  role:Role;

}
