import {
    CallHandler,
    ExecutionContext, Inject,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {AppLoggerService} from "./app-logger.service";
import { hostname } from "os";

@Injectable()
export class ResponseLoggingInterceptor implements NestInterceptor {
    constructor(@Inject(AppLoggerService) private readonly logger) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const timestamp = Date.now();
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        const ctx = `${hostname()}::${req.originalUrl}`;
        const debugContext = `${context.getClass().name}::${context.getHandler().name}`;

        return next
            .handle()
            .pipe(tap((data) => {

                const requestId = req.headers['requestId'];
                const statusCode = res.statusCode;
                const duration = `${timestamp - req.headers['timestamp']}ms`;

                this.logger.log(`Response`, ctx,
                    { requestId, statusCode, timestamp, duration, debugContext, data });
            }));
    }


}
