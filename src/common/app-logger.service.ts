import { Injectable, Logger, Scope} from '@nestjs/common';

export enum LOG_LEVEL {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG',
    VERBOSE = 'VERBOSE',
}

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService extends Logger {

    private line(level: LOG_LEVEL, message: string, optionalParameters: any[]):string {
        return `[${level}] ${message}: ${JSON.stringify(optionalParameters[0])}`;
    }

    log(message: string, context: string, ...optionalParams: any[]) {
        super.log(this.line(LOG_LEVEL.INFO, message, optionalParams), context);
    }

    error(message: string, trace: string, context?: string, ...optionalParams: any[]) {
        super.error(this.line(LOG_LEVEL.ERROR, message, optionalParams), trace, context);
    }

    warn(message: string, context: string, ...optionalParams: any[]) {
        super.warn(this.line(LOG_LEVEL.WARN, message, optionalParams), context);
    }

    debug(message: string, context: string, ...optionalParams: any[]) {
        super.debug(this.line(LOG_LEVEL.DEBUG, message, optionalParams), context);
    }

    verbose(message: string, context: string, ...optionalParams: any[]) {
        super.verbose(this.line(LOG_LEVEL.VERBOSE, message, optionalParams), context);
    }

}
