import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common';


/**
 * Authorizing access to a resource to its owner only
 */
@Injectable()
export class UserOwnerGuard implements CanActivate {

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        return request.user.username === request.params.username;
    }

}