import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import {GlobalExceptionFilter} from './common/global-exception.filter';
import {AppLoggerService} from './common/app-logger.service';
import {ResponseLoggingInterceptor} from './common/response-logging-interceptor.service';
import {RequestLoggerMiddleware} from './common/request-logger.middleware';
import { UserController } from './user/user.controller';
import { ProductController } from './product/product.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { ProductService } from './product/product.service';
import { AuthService } from './auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './auth/local.strategy';
import { TransactionService } from './transactions/transaction.service';


@Module({
  imports: [PassportModule],
  controllers: [AppController, UserController, ProductController],
  providers: [
    AppService, AppLoggerService, UserService, ProductService,
    TransactionService, AuthService, LocalStrategy,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseLoggingInterceptor,
    }],
  exports: [AppLoggerService, UserService, ProductService, TransactionService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
