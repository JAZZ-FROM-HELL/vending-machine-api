import {Inject, Injectable, NestMiddleware} from '@nestjs/common';
import { Request, Response } from 'express';
import {uuid} from "uuidv4";
import {AppLoggerService} from "./app-logger.service";
import {hostname} from "os";

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {

    constructor(@Inject(AppLoggerService) private readonly logger) {}

    use(req: Request, res: Response, next: Function) {
        req.headers['timestamp'] = Date.now().toString();
        const requestId = req.headers['requestId'] ?? uuid();
        const requestUrl = req.originalUrl;
        const ctx = `${hostname()}::${requestUrl}`;
        const { method, params, query, headers, body } = req;

        this.logger.log(`Request`,
            ctx, {requestId, method, requestUrl, params, query, headers, body });

        // for response & exception logging
        req.headers['requestId'] = requestId;
        req.headers['context'] = ctx;

        next();
    }
}
