import { BadRequestException, Injectable, MethodNotAllowedException } from '@nestjs/common';
import {User} from "./user";
import { CrudService } from '../common/crud.service';

@Injectable()
export class UserService extends CrudService<User, string> {

    public static readonly BAD_USER_CREDENTIALS_ERROR:BadRequestException =
      new BadRequestException('Bad user credentials');

    async findAll(): Promise<User[]> {
        throw new MethodNotAllowedException('Find all not supported');
    }

    protected key(user:User):string {
        return user.username;
    }

    protected async validate(user:User, shouldExist:boolean) {
        if (!user || !user.username || !user.password)
            throw UserService.BAD_USER_CREDENTIALS_ERROR;
        return super.validate(user, shouldExist);
    }

}