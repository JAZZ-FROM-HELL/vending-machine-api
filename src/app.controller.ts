import { Controller, Get, UseGuards, Inject, Query, Put, ParseIntPipe } from '@nestjs/common';
import { Roles } from './auth/roles.decorator';
import { Role } from './auth/role.enum';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { AppService } from './app.service';
import { Coin } from './user/coin.enum';
import { CoinPipe } from './user/coin.pipe';
import { StatsDto } from './user/stats.dto';

@Controller()
export class AppController {

  constructor(@Inject(AppService) private readonly appService:AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Put('/deposit')
  @Roles(Role.BUYER)
  @UseGuards(LocalAuthGuard, RolesGuard)
  async deposit(
          @Query('username') username:string,
          @Query('password') password:string,
          @Query('coin', CoinPipe) coin:Coin,
          @Query('amount', ParseIntPipe) amount:number) {
    return this.appService.deposit(username, coin, amount);
  }

  @Put('/buy')
  @Roles(Role.BUYER)
  @UseGuards(LocalAuthGuard, RolesGuard)
  async buy(
      @Query('username') username:string,
      @Query('password') password:string,
      @Query('productName') productName:string,
      @Query('units', ParseIntPipe) units:number):Promise<StatsDto> {
    return this.appService.buy(username, productName, units);
  }

  @Put('/reset')
  @Roles(Role.BUYER)
  @UseGuards(LocalAuthGuard, RolesGuard)
  async reset(
      @Query('username') username:string,
      @Query('password') password:string) {
    return this.appService.reset(username);
  }

}
