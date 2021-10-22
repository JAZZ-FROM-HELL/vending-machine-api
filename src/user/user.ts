import { Role } from '../auth/role.enum';
import { Entity } from '../common/entity';
import { Change } from './change';
import { IsEnum, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';


export class User extends Entity<string> {

  @IsNotEmpty()
  username:string;

  @IsNotEmpty()
  password:string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Change)
  deposit?:Change = new Change();

  @IsOptional()
  @IsEnum(Role)
  role:Role;

}
