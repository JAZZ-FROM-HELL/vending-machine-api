import {Injectable, CanActivate, ExecutionContext} from '@nestjs/common';


/**
 * Authorizing access to a resource to its owner only
 */
@Injectable()
export class ProductOwnerGuard implements CanActivate {

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        return request.body['sellerId'] === request.query.username;
    }

}