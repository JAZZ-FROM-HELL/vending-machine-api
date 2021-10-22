import {
  Controller,
  Get,
  Post,
  UseGuards,
  Inject,
  Param,
  Body,
  Put,
  Delete,
  NotFoundException, HttpCode, HttpStatus, ValidationPipe,
} from '@nestjs/common';
import {LocalAuthGuard} from "../auth/local-auth.guard";
import {UserService} from "./user.service";
import {User} from "./user";
import { UserOwnerGuard } from '../auth/user-owner.guard';

/**
 * NestJS consumes and produces "application/json" by default
 */

/*
 * due to the default LocalStrategy implemented by PassportJS which mixes (in fact confuses)
 * query params and user properties with "username" and "password" identifiers, we can not
 * use them as URL query params on /user endpoints without devising a new custom strategy
 * (or defining a specific API key logic, which would likely be the case in a real-world app)
 */

@Controller('user')
export class UserController {

  constructor(@Inject(UserService) private readonly userService:UserService) {}


  @Get(':username')
  async get(@Param('username') username: string): Promise<User> {
    const user:User = await this.userService.findOne(username);
    if (user) return user;
    else throw new NotFoundException('User not found');
  }

  // no auth for User POST
  // POST returning 204 by default
  @Post()
  async create(@Body() user:User):Promise<User> {
    return this.userService.create(user);
  }

  // users can change any property except their credentials (unauthorized)
  @Put(':username')
  @UseGuards(LocalAuthGuard, UserOwnerGuard)
  async update(
      @Param('username') username: string,
      @Body() user:User) {
    return this.userService.update(user);
  }

  @Delete(':username')
  @UseGuards(LocalAuthGuard, UserOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
      @Param('username') username: string,
      @Body() user:User) {
    return this.userService.delete(username);
  }


}
