import {Catch, ArgumentsHost, HttpException, HttpStatus, Inject } from '@nestjs/common';
import {AppLoggerService} from "./app-logger.service";
import {BaseExceptionFilter} from "@nestjs/core";

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
    constructor(@Inject(AppLoggerService) private readonly logger) {
        super();
    }

    catch(exception: Error, host: ArgumentsHost) {
        const timestamp = Date.now();
        const ctx = host.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const attributes = {
            statusCode: status,
            message: exception.message,
            requestId: req.headers['requestId'],
            timestamp: timestamp,
            duration: `${timestamp - req.headers['timestamp']}ms`,
            path: res.url,
            debug: req.headers['DebugContext'],
        };

        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(`${exception.name}`, exception.stack, req.headers['context'], attributes);
        } else if (status >= 400 && status < 500 ) {
            this.logger.warn(`${exception.name}`, req.headers['context'], attributes);
        }

        super.catch(exception, host);
    }
}
